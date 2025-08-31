/**
 * App-Common-Model アーキテクチャ制約ルール
 * フロントエンドディレクトリ再編成に伴う依存関係制約を強制
 */
module.exports = {
  'no-cross-layer-imports': {
    meta: {
      type: 'problem',
      docs: {
        description: 'App-Common-Model architecture layer dependency rules',
        category: 'Possible Errors',
      },
      schema: [],
      messages: {
        commonToModel: 'Common layer cannot import from Model layer ({{from}} → {{to}}). Move shared logic to Common layer.',
        commonToApp: 'Common layer cannot import from App layer ({{from}} → {{to}}). Move shared logic to Common layer.',
        appToApp: 'App pages cannot import from other App pages ({{from}} → {{to}}). Use Common or Model layers for shared logic.',
        modelCircular: 'Model domains should not have circular dependencies ({{from}} → {{to}}). Consider one-way dependency.',
      },
    },
    create(context) {
      const filename = context.getFilename();
      
      // ファイルの層とドメインを判定
      function getLayerInfo(filepath) {
        if (filepath.includes('/src/common/')) {
          return { layer: 'common', domain: null };
        }
        if (filepath.includes('/src/model/')) {
          const domainMatch = filepath.match(/\/src\/model\/([^\/]+)/);
          return { layer: 'model', domain: domainMatch ? domainMatch[1] : null };
        }
        if (filepath.includes('/src/app/')) {
          const pageMatch = filepath.match(/\/src\/app\/[^\/]*\/([^\/]+)/);
          return { layer: 'app', domain: pageMatch ? pageMatch[1] : null };
        }
        return { layer: 'other', domain: null };
      }

      // importパスから層とドメインを判定
      function getImportLayerInfo(importPath) {
        if (importPath.startsWith('@/common/')) {
          return { layer: 'common', domain: null };
        }
        if (importPath.startsWith('@/model/')) {
          const domainMatch = importPath.match(/^@\/model\/([^\/]+)/);
          return { layer: 'model', domain: domainMatch ? domainMatch[1] : null };
        }
        if (importPath.startsWith('@/app/')) {
          const pageMatch = importPath.match(/^@\/app\/[^\/]*\/([^\/]+)/);
          return { layer: 'app', domain: pageMatch ? pageMatch[1] : null };
        }
        return { layer: 'external', domain: null };
      }

      const currentFile = getLayerInfo(filename);

      return {
        ImportDeclaration(node) {
          const importPath = node.source.value;
          const importInfo = getImportLayerInfo(importPath);

          // Common層の制約チェック
          if (currentFile.layer === 'common') {
            if (importInfo.layer === 'model') {
              context.report({
                node,
                messageId: 'commonToModel',
                data: { from: 'Common', to: 'Model' }
              });
            }
            if (importInfo.layer === 'app') {
              context.report({
                node,
                messageId: 'commonToApp', 
                data: { from: 'Common', to: 'App' }
              });
            }
          }

          // App層の制約チェック（ページ間相互依存禁止）
          if (currentFile.layer === 'app' && importInfo.layer === 'app') {
            if (currentFile.domain !== importInfo.domain) {
              context.report({
                node,
                messageId: 'appToApp',
                data: { from: currentFile.domain, to: importInfo.domain }
              });
            }
          }

          // Model層の循環依存チェック（基本的なチェック）
          if (currentFile.layer === 'model' && importInfo.layer === 'model') {
            if (currentFile.domain !== importInfo.domain) {
              // 簡単なチェック：異なるドメイン間のimportを警告
              // より詳細な循環依存検出は将来的に実装
              context.report({
                node,
                messageId: 'modelCircular',
                data: { from: currentFile.domain, to: importInfo.domain }
              });
            }
          }
        },
      };
    },
  },
};