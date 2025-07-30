/**
 * IndexedDB 工具类
 * 用于管理历史记录的本地存储
 */

import { HistoryRecord, HistorySearchFilter, HistoryStats } from '../types/history';

const DB_NAME = 'PromptBuilderDB';
const DB_VERSION = 1;
const STORE_NAME = 'historyRecords';

class IndexedDBManager {
    private db: IDBDatabase | null = null;

    // 初始化数据库
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                // 创建历史记录存储
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    
                    // 创建索引
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('title', 'title', { unique: false });
                    store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                }
            };
        });
    }

    // 确保数据库已初始化
    private async ensureDB(): Promise<IDBDatabase> {
        if (!this.db) {
            await this.init();
        }
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        return this.db;
    }

    // 保存历史记录
    async saveRecord(record: HistoryRecord): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(record);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to save record'));
        });
    }

    // 获取单个历史记录
    async getRecord(id: string): Promise<HistoryRecord | null> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result || null);
            };
            request.onerror = () => reject(new Error('Failed to get record'));
        });
    }

    // 删除历史记录
    async deleteRecord(id: string): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to delete record'));
        });
    }

    // 搜索历史记录
    async searchRecords(filter: HistorySearchFilter): Promise<HistoryRecord[]> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            
            // 使用时间戳索引进行排序
            const index = store.index('timestamp');
            const request = index.openCursor(null, filter.sortOrder === 'desc' ? 'prev' : 'next');
            
            const results: HistoryRecord[] = [];
            let count = 0;
            const offset = filter.offset || 0;
            const limit = filter.limit || 50;

            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor && count < offset + limit) {
                    const record = cursor.value as HistoryRecord;
                    
                    // 应用过滤条件
                    if (this.matchesFilter(record, filter)) {
                        if (count >= offset) {
                            results.push(record);
                        }
                        count++;
                    }
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => reject(new Error('Failed to search records'));
        });
    }

    // 检查记录是否匹配过滤条件
    private matchesFilter(record: HistoryRecord, filter: HistorySearchFilter): boolean {
        // 关键词搜索
        if (filter.keyword) {
            const keyword = filter.keyword.toLowerCase();
            const searchText = [
                record.title,
                record.description || '',
                record.roleContent,
                record.ruleContent,
                record.taskContent,
                record.outputContent
            ].join(' ').toLowerCase();
            
            if (!searchText.includes(keyword)) {
                return false;
            }
        }

        // 标签过滤
        if (filter.tags && filter.tags.length > 0) {
            const hasMatchingTag = filter.tags.some(tag => 
                record.tags.includes(tag)
            );
            if (!hasMatchingTag) {
                return false;
            }
        }

        // 日期范围过滤
        if (filter.dateRange) {
            if (record.timestamp < filter.dateRange.start || 
                record.timestamp > filter.dateRange.end) {
                return false;
            }
        }

        return true;
    }

    // 获取统计信息
    async getStats(): Promise<HistoryStats> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const records = request.result as HistoryRecord[];
                
                const stats: HistoryStats = {
                    totalRecords: records.length,
                    totalSize: this.calculateTotalSize(records),
                    mostUsedTags: this.calculateTagStats(records)
                };

                if (records.length > 0) {
                    const timestamps = records.map(r => r.timestamp);
                    stats.oldestRecord = Math.min(...timestamps);
                    stats.newestRecord = Math.max(...timestamps);
                }

                resolve(stats);
            };

            request.onerror = () => reject(new Error('Failed to get stats'));
        });
    }

    // 计算数据总大小
    private calculateTotalSize(records: HistoryRecord[]): number {
        return records.reduce((total, record) => {
            const recordSize = JSON.stringify(record).length;
            return total + recordSize;
        }, 0);
    }

    // 计算标签统计
    private calculateTagStats(records: HistoryRecord[]): Array<{ tag: string; count: number }> {
        const tagCounts = new Map<string, number>();
        
        records.forEach(record => {
            record.tags.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
        });

        return Array.from(tagCounts.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // 返回前10个最常用标签
    }

    // 清空所有记录
    async clearAll(): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to clear records'));
        });
    }

    // 导出所有数据
    async exportAll(): Promise<HistoryRecord[]> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('Failed to export data'));
        });
    }

    // 批量导入数据
    async importRecords(records: HistoryRecord[]): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            let completed = 0;
            const total = records.length;

            if (total === 0) {
                resolve();
                return;
            }

            records.forEach(record => {
                const request = store.put(record);
                request.onsuccess = () => {
                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                };
                request.onerror = () => {
                    reject(new Error('Failed to import record'));
                };
            });
        });
    }
}

// 创建单例实例
export const historyDB = new IndexedDBManager();
