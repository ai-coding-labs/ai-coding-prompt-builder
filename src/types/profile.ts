/**
 * Profile配置相关类型定义
 */

import { FileInfo } from './types';

// Profile配置数据结构
export interface Profile {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    roleContent: string;
    ruleContent: string;
    outputContent: string;
    defaultFiles?: FileInfo[];
    tags: string[];
    createdAt: number;
    updatedAt: number;
    isDefault?: boolean;
    category?: string;
}

// Profile分类
export interface ProfileCategory {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
}

// Profile搜索过滤条件
export interface ProfileSearchFilter {
    keyword?: string;
    category?: string;
    tags?: string[];
    sortBy: 'name' | 'createdAt' | 'updatedAt';
    sortOrder: 'asc' | 'desc';
}

// 预定义的Profile模板
export const DEFAULT_PROFILES: Profile[] = [
    {
        id: 'general-coding',
        name: '通用编程助手',
        description: '适用于一般编程任务的提示词配置',
        icon: '💻',
        color: '#2196F3',
        roleContent: `你是一个专业的编程助手，具有丰富的软件开发经验。你能够：
- 理解各种编程语言和框架
- 提供高质量的代码建议和解决方案
- 遵循最佳实践和编码规范
- 帮助调试和优化代码`,
        ruleContent: `请遵循以下规则：
1. 提供清晰、可读的代码
2. 添加必要的注释说明
3. 考虑代码的性能和安全性
4. 遵循相应语言的最佳实践
5. 如果不确定，请说明假设条件`,
        outputContent: `请按以下格式输出：
## 解决方案
[提供具体的解决方案]

## 代码实现
\`\`\`[语言]
[代码内容]
\`\`\`

## 说明
[解释代码逻辑和关键点]

## 注意事项
[需要注意的问题或改进建议]`,
        tags: ['编程', '通用', '开发'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isDefault: true,
        category: 'development'
    },
    {
        id: 'code-review',
        name: '代码审查专家',
        description: '专门用于代码审查和质量评估',
        icon: '🔍',
        color: '#FF9800',
        roleContent: `你是一个经验丰富的代码审查专家，专注于：
- 代码质量评估
- 安全漏洞识别
- 性能优化建议
- 最佳实践检查
- 代码规范审查`,
        ruleContent: `代码审查规则：
1. 仔细检查代码逻辑和结构
2. 识别潜在的安全问题
3. 评估代码性能和可维护性
4. 检查是否遵循编码规范
5. 提供具体的改进建议
6. 保持客观和建设性的态度`,
        outputContent: `## 审查总结
[整体评价和主要发现]

## 问题清单
### 🔴 严重问题
[需要立即修复的问题]

### 🟡 改进建议
[可以优化的地方]

### 🟢 优点
[代码的亮点]

## 修改建议
[具体的修改方案]

## 评分
代码质量: [1-10分]
安全性: [1-10分]
可维护性: [1-10分]`,
        tags: ['代码审查', '质量', '安全'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        category: 'review'
    },
    {
        id: 'bug-fix',
        name: '问题诊断专家',
        description: '专门用于调试和修复代码问题',
        icon: '🐛',
        color: '#F44336',
        roleContent: `你是一个专业的问题诊断和调试专家，擅长：
- 快速定位代码问题
- 分析错误原因
- 提供修复方案
- 预防类似问题
- 调试技巧指导`,
        ruleContent: `问题诊断规则：
1. 仔细分析错误信息和症状
2. 逐步排查可能的原因
3. 提供多种解决方案
4. 解释问题产生的根本原因
5. 给出预防措施
6. 如需更多信息，明确说明`,
        outputContent: `## 问题分析
[问题的详细分析]

## 可能原因
1. [原因1及其可能性]
2. [原因2及其可能性]
3. [其他可能原因]

## 解决方案
### 方案一（推荐）
\`\`\`[语言]
[修复代码]
\`\`\`

### 方案二（备选）
[备选解决方案]

## 预防措施
[如何避免类似问题]

## 调试建议
[调试技巧和工具推荐]`,
        tags: ['调试', '修复', '问题诊断'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        category: 'debug'
    },
    {
        id: 'architecture-design',
        name: '架构设计顾问',
        description: '用于系统架构设计和技术选型',
        icon: '🏗️',
        color: '#9C27B0',
        roleContent: `你是一个资深的系统架构师，专长包括：
- 系统架构设计
- 技术选型建议
- 性能和扩展性规划
- 微服务架构
- 数据库设计
- 安全架构`,
        ruleContent: `架构设计原则：
1. 考虑系统的可扩展性和可维护性
2. 平衡性能、成本和复杂度
3. 遵循架构最佳实践
4. 考虑团队技术栈和能力
5. 提供多种方案对比
6. 考虑未来发展需求`,
        outputContent: `## 架构概述
[整体架构描述]

## 技术选型
| 组件 | 推荐技术 | 理由 |
|------|----------|------|
| [组件1] | [技术1] | [选择理由] |

## 架构图
[架构图描述或建议]

## 关键设计决策
1. [决策1及其理由]
2. [决策2及其理由]

## 风险和挑战
[潜在风险及应对策略]

## 实施建议
[分阶段实施计划]`,
        tags: ['架构', '设计', '技术选型'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        category: 'architecture'
    }
];

// 预定义分类
export const DEFAULT_CATEGORIES: ProfileCategory[] = [
    {
        id: 'development',
        name: '开发编程',
        description: '通用编程和开发相关的配置',
        color: '#2196F3',
        icon: '💻'
    },
    {
        id: 'review',
        name: '代码审查',
        description: '代码质量和审查相关的配置',
        color: '#FF9800',
        icon: '🔍'
    },
    {
        id: 'debug',
        name: '调试修复',
        description: '问题诊断和调试相关的配置',
        color: '#F44336',
        icon: '🐛'
    },
    {
        id: 'architecture',
        name: '架构设计',
        description: '系统架构和设计相关的配置',
        color: '#9C27B0',
        icon: '🏗️'
    },
    {
        id: 'custom',
        name: '自定义',
        description: '用户自定义的配置',
        color: '#607D8B',
        icon: '⚙️'
    }
];
