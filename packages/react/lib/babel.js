'use strict';

module.exports = function({ types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        if (path.node.callee.name !== 'Import') return;

        const callArgs = path.get('arguments');
        const modulePath = callArgs.shift();
        const moduleNode = modulePath.node;

        t.assertStringLiteral(moduleNode);

        const loader = t.arrowFunctionExpression(
          [],
          this.opts.target === 'node'
            ? t.callExpression(
                t.memberExpression(
                  t.identifier('Promise'),
                  t.identifier('resolve')
                ),
                [t.callExpression(t.identifier('require'), [moduleNode])]
              )
            : t.callExpression(t.identifier('import'), [moduleNode])
        );

        const loading = callArgs.length
          ? callArgs.shift().node
          : t.arrowFunctionExpression(
              [],
              t.blockStatement([t.returnStatement(t.nullLiteral())])
            );

        const weakId = t.callExpression(
          t.memberExpression(
            t.identifier('require'),
            t.identifier('resolveWeak')
          ),
          [moduleNode]
        );

        modulePath.replaceWith(
          t.objectExpression([
            t.objectProperty(t.identifier('loader'), loader),
            t.objectProperty(t.identifier('loading'), loading),
            t.objectProperty(t.identifier('weakId'), weakId),
            t.objectProperty(t.identifier('module'), moduleNode),
          ])
        );
      },
    },
  };
};
