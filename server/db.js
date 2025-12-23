import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_DIR = path.join(__dirname, '../storage');
const USERS_DIR = path.join(STORAGE_DIR, 'users');
const FAMILIES_DIR = path.join(STORAGE_DIR, 'families');
const USER_INDEX_FILE = path.join(STORAGE_DIR, 'user_index.json');

// Ensure directories exist
const init = async () => {
  await fs.ensureDir(STORAGE_DIR);
  await fs.ensureDir(USERS_DIR);
  await fs.ensureDir(FAMILIES_DIR);
  if (!await fs.pathExists(USER_INDEX_FILE)) {
    await fs.writeJson(USER_INDEX_FILE, {});
  }
  
  // Create default root user for dev/testing
  const index = await fs.readJson(USER_INDEX_FILE);
  if (!index['root']) {
    console.log('Initializing default root user...');
    const userId = 'root-dev-id';
    const userDir = path.join(USERS_DIR, userId);
    await fs.ensureDir(userDir);
    await fs.ensureDir(path.join(userDir, 'photos'));

    const profile = {
      id: userId,
      username: 'root',
      password: 'root',
      email: 'root@dev.local',
      familyId: null,
      role: 'admin',
      joinedAt: new Date().toISOString()
    };

    await fs.writeJson(path.join(userDir, 'profile.json'), profile);
    await fs.writeJson(path.join(userDir, 'notifications.json'), []);
    
    index['root'] = userId;
    await fs.writeJson(USER_INDEX_FILE, index);
    console.log('Root user created: username="root", password="root"');
  }
};

init();

export const db = {
  // User Management
  async createUser(username, password, email) {
    const index = await fs.readJson(USER_INDEX_FILE);
    if (index[username]) {
      throw new Error('User already exists');
    }

    const userId = uuidv4();
    const userDir = path.join(USERS_DIR, userId);
    await fs.ensureDir(userDir);
    await fs.ensureDir(path.join(userDir, 'photos'));

    const profile = {
      id: userId,
      username,
      password, // In production, hash this!
      email,
      familyId: null,
      role: null, // 'admin', 'member'
      joinedAt: new Date().toISOString()
    };

    await fs.writeJson(path.join(userDir, 'profile.json'), profile);
    await fs.writeJson(path.join(userDir, 'notifications.json'), []);
    
    // Update index
    index[username] = userId;
    await fs.writeJson(USER_INDEX_FILE, index);

    return { id: userId, username, email };
  },

  async loginUser(username, password) {
    const index = await fs.readJson(USER_INDEX_FILE);
    const userId = index[username];
    if (!userId) return null;

    const profile = await fs.readJson(path.join(USERS_DIR, userId, 'profile.json'));
    if (profile.password !== password) return null;

    const { password: _, ...safeProfile } = profile;
    return safeProfile;
  },

  async getUser(userId) {
    return await fs.readJson(path.join(USERS_DIR, userId, 'profile.json'));
  },

  async updateUser(userId, updates) {
    const profilePath = path.join(USERS_DIR, userId, 'profile.json');
    const profile = await fs.readJson(profilePath);
    const newProfile = { ...profile, ...updates };
    await fs.writeJson(profilePath, newProfile);
    return newProfile;
  },

  // Family Management
  async createFamily(creatorId, familyName) {
    const familyId = uuidv4();
    const family = {
      id: familyId,
      name: familyName,
      creatorId,
      members: [
        { userId: creatorId, role: 'admin', joinedAt: new Date().toISOString() }
      ]
    };

    await fs.writeJson(path.join(FAMILIES_DIR, `${familyId}.json`), family);
    
    // Update creator's profile
    await this.updateUser(creatorId, { familyId, role: 'admin' });

    return family;
  },

  async getFamily(familyId) {
    if (!familyId) return null;
    const file = path.join(FAMILIES_DIR, `${familyId}.json`);
    if (!await fs.pathExists(file)) return null;
    return await fs.readJson(file);
  },

  async inviteToFamily(fromUserId, toUsername) {
    const index = await fs.readJson(USER_INDEX_FILE);
    const toUserId = index[toUsername];
    if (!toUserId) throw new Error('User not found');

    const fromUser = await this.getUser(fromUserId);
    if (!fromUser.familyId) throw new Error('You are not in a family');

    const notification = {
      id: uuidv4(),
      type: 'invite',
      fromUserId,
      fromUsername: fromUser.username,
      familyId: fromUser.familyId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const notifPath = path.join(USERS_DIR, toUserId, 'notifications.json');
    const notifs = await fs.readJson(notifPath);
    notifs.push(notification);
    await fs.writeJson(notifPath, notifs);

    return notification;
  },

  async getNotifications(userId) {
    const notifPath = path.join(USERS_DIR, userId, 'notifications.json');
    return await fs.readJson(notifPath);
  },

  async handleInvite(userId, notificationId, accept) {
    const notifPath = path.join(USERS_DIR, userId, 'notifications.json');
    const notifs = await fs.readJson(notifPath);
    const notifIndex = notifs.findIndex(n => n.id === notificationId);
    
    if (notifIndex === -1) throw new Error('Notification not found');
    const notif = notifs[notifIndex];

    if (accept) {
      // Add to family
      const family = await this.getFamily(notif.familyId);
      if (family) {
        family.members.push({
          userId,
          role: 'member',
          joinedAt: new Date().toISOString()
        });
        await fs.writeJson(path.join(FAMILIES_DIR, `${notif.familyId}.json`), family);
        
        // Update user profile
        await this.updateUser(userId, { familyId: notif.familyId, role: 'member' });
      }
    }

    // Remove notification (or mark handled)
    notifs.splice(notifIndex, 1);
    await fs.writeJson(notifPath, notifs);
    
    return { success: true };
  },
  
  async updateMemberRole(adminId, targetUserId, newRole) {
    const admin = await this.getUser(adminId);
    if (!admin.familyId) throw new Error('Not in a family');
    
    const family = await this.getFamily(admin.familyId);
    // Check if admin is actually admin
    const adminMember = family.members.find(m => m.userId === adminId);
    if (!adminMember || adminMember.role !== 'admin') throw new Error('Permission denied');
    
    const targetMember = family.members.find(m => m.userId === targetUserId);
    if (!targetMember) throw new Error('User not in family');
    
    targetMember.role = newRole;
    await fs.writeJson(path.join(FAMILIES_DIR, `${admin.familyId}.json`), family);
    
    // Update target user profile as well
    await this.updateUser(targetUserId, { role: newRole });
    
    return family;
  },

  // Diagnosis History Management
  async addDiagnosis(userId, diagnosisRecord) {
    const historyPath = path.join(USERS_DIR, userId, 'diagnosis_history.json');
    let history = [];
    if (await fs.pathExists(historyPath)) {
      history = await fs.readJson(historyPath);
    }
    
    // Ensure the new record is at the beginning
    history.unshift(diagnosisRecord);
    await fs.writeJson(historyPath, history);
    return diagnosisRecord;
  },

  async getDiagnosisHistory(userId) {
    const historyPath = path.join(USERS_DIR, userId, 'diagnosis_history.json');
    if (!await fs.pathExists(historyPath)) {
      return [];
    }
    return await fs.readJson(historyPath);
  },

  async deleteDiagnosis(userId, recordId) {
    const historyPath = path.join(USERS_DIR, userId, 'diagnosis_history.json');
    if (!await fs.pathExists(historyPath)) return;
    
    let history = await fs.readJson(historyPath);
    history = history.filter(item => item.id !== recordId);
    await fs.writeJson(historyPath, history);
  }
};
