/**
 * Profile配置管理工具
 */

import { Profile, ProfileSearchFilter, DEFAULT_PROFILES } from '../types/profile';

const STORAGE_KEY = 'prompt_profiles';
const CURRENT_PROFILE_KEY = 'current_profile';

class ProfileManager {
    // 获取所有Profile
    getAllProfiles(): Profile[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const profiles = JSON.parse(stored);
                // 确保默认Profile存在
                return this.ensureDefaultProfiles(profiles);
            }
            // 首次使用，初始化默认Profile
            return this.initializeDefaultProfiles();
        } catch (error) {
            console.error('Failed to load profiles:', error);
            return this.initializeDefaultProfiles();
        }
    }

    // 确保默认Profile存在
    private ensureDefaultProfiles(profiles: Profile[]): Profile[] {
        const existingIds = new Set(profiles.map(p => p.id));
        const missingDefaults = DEFAULT_PROFILES.filter(p => !existingIds.has(p.id));
        
        if (missingDefaults.length > 0) {
            const updatedProfiles = [...profiles, ...missingDefaults];
            this.saveProfiles(updatedProfiles);
            return updatedProfiles;
        }
        
        return profiles;
    }

    // 初始化默认Profile
    private initializeDefaultProfiles(): Profile[] {
        this.saveProfiles(DEFAULT_PROFILES);
        return DEFAULT_PROFILES;
    }

    // 保存所有Profile
    private saveProfiles(profiles: Profile[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
        } catch (error) {
            console.error('Failed to save profiles:', error);
        }
    }

    // 获取单个Profile
    getProfile(id: string): Profile | null {
        const profiles = this.getAllProfiles();
        return profiles.find(p => p.id === id) || null;
    }

    // 保存Profile
    saveProfile(profile: Profile): void {
        const profiles = this.getAllProfiles();
        const existingIndex = profiles.findIndex(p => p.id === profile.id);
        
        const updatedProfile = {
            ...profile,
            updatedAt: Date.now()
        };

        if (existingIndex >= 0) {
            profiles[existingIndex] = updatedProfile;
        } else {
            profiles.push(updatedProfile);
        }

        this.saveProfiles(profiles);
    }

    // 删除Profile
    deleteProfile(id: string): boolean {
        const profiles = this.getAllProfiles();
        const filteredProfiles = profiles.filter(p => p.id !== id);
        
        if (filteredProfiles.length !== profiles.length) {
            this.saveProfiles(filteredProfiles);
            
            // 如果删除的是当前Profile，清除当前选择
            if (this.getCurrentProfileId() === id) {
                this.setCurrentProfile(null);
            }
            
            return true;
        }
        
        return false;
    }

    // 复制Profile
    duplicateProfile(id: string, newName?: string): Profile | null {
        const originalProfile = this.getProfile(id);
        if (!originalProfile) return null;

        const newProfile: Profile = {
            ...originalProfile,
            id: `${originalProfile.id}_copy_${Date.now()}`,
            name: newName || `${originalProfile.name} (副本)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isDefault: false
        };

        this.saveProfile(newProfile);
        return newProfile;
    }

    // 搜索Profile
    searchProfiles(filter: ProfileSearchFilter): Profile[] {
        let profiles = this.getAllProfiles();

        // 关键词搜索
        if (filter.keyword) {
            const keyword = filter.keyword.toLowerCase();
            profiles = profiles.filter(p => 
                p.name.toLowerCase().includes(keyword) ||
                (p.description && p.description.toLowerCase().includes(keyword)) ||
                p.tags.some(tag => tag.toLowerCase().includes(keyword))
            );
        }

        // 分类过滤
        if (filter.category) {
            profiles = profiles.filter(p => p.category === filter.category);
        }

        // 标签过滤
        if (filter.tags && filter.tags.length > 0) {
            profiles = profiles.filter(p => 
                filter.tags!.some(tag => p.tags.includes(tag))
            );
        }

        // 排序
        profiles.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (filter.sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'createdAt':
                    aValue = a.createdAt;
                    bValue = b.createdAt;
                    break;
                case 'updatedAt':
                    aValue = a.updatedAt;
                    bValue = b.updatedAt;
                    break;
                default:
                    return 0;
            }

            if (filter.sortOrder === 'desc') {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            } else {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            }
        });

        return profiles;
    }

    // 获取当前选中的Profile ID
    getCurrentProfileId(): string | null {
        return localStorage.getItem(CURRENT_PROFILE_KEY);
    }

    // 设置当前Profile
    setCurrentProfile(profileId: string | null): void {
        if (profileId) {
            localStorage.setItem(CURRENT_PROFILE_KEY, profileId);
        } else {
            localStorage.removeItem(CURRENT_PROFILE_KEY);
        }
    }

    // 获取当前Profile
    getCurrentProfile(): Profile | null {
        const currentId = this.getCurrentProfileId();
        if (currentId) {
            return this.getProfile(currentId);
        }
        
        // 如果没有当前Profile，返回默认的第一个
        const profiles = this.getAllProfiles();
        const defaultProfile = profiles.find(p => p.isDefault) || profiles[0];
        if (defaultProfile) {
            this.setCurrentProfile(defaultProfile.id);
            return defaultProfile;
        }
        
        return null;
    }

    // 导出Profile
    exportProfiles(profileIds?: string[]): string {
        const profiles = this.getAllProfiles();
        const toExport = profileIds 
            ? profiles.filter(p => profileIds.includes(p.id))
            : profiles;

        return JSON.stringify({
            version: '1.0',
            exportTime: Date.now(),
            profiles: toExport
        }, null, 2);
    }

    // 导入Profile
    importProfiles(jsonData: string): { success: number; errors: string[] } {
        try {
            const data = JSON.parse(jsonData);
            const profiles = data.profiles || [];
            const errors: string[] = [];
            let success = 0;

            profiles.forEach((profile: any, index: number) => {
                try {
                    // 验证Profile结构
                    if (!profile.id || !profile.name) {
                        errors.push(`Profile ${index + 1}: 缺少必要字段`);
                        return;
                    }

                    // 生成新的ID避免冲突
                    const newProfile: Profile = {
                        ...profile,
                        id: `imported_${profile.id}_${Date.now()}`,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        isDefault: false
                    };

                    this.saveProfile(newProfile);
                    success++;
                } catch (error) {
                    errors.push(`Profile ${index + 1}: ${error}`);
                }
            });

            return { success, errors };
        } catch (error) {
            return { success: 0, errors: [`导入失败: ${error}`] };
        }
    }

    // 获取Profile统计信息
    getStats() {
        const profiles = this.getAllProfiles();
        const categories = new Map<string, number>();
        const tags = new Map<string, number>();

        profiles.forEach(profile => {
            // 统计分类
            const category = profile.category || 'uncategorized';
            categories.set(category, (categories.get(category) || 0) + 1);

            // 统计标签
            profile.tags.forEach(tag => {
                tags.set(tag, (tags.get(tag) || 0) + 1);
            });
        });

        return {
            totalProfiles: profiles.length,
            categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
            tags: Array.from(tags.entries()).map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count).slice(0, 10)
        };
    }
}

// 创建单例实例
export const profileManager = new ProfileManager();
