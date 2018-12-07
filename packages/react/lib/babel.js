'use strict';

module.exports = function({ types: t }) {
  return {
    visitor: {
      ImportDeclaration(path) {
        const modules = ['@untool/react', 'untool', this.opts.module];
        const source = path.node.source.value;
        if (!modules.includes(source)) return;

        const specifiers = path.get('specifiers');
        const specifier = specifiers.find(
          (specifier) => specifier.node.imported.name === 'importComponent'
        );
        if (!specifier) return;

        const bindingName = specifier.node.local.name;
        const binding = path.scope.getBinding(bindingName);

        binding.referencePaths.forEach((refPath) => {
          const call = refPath.parentPath;
          t.assertCallExpression(call);

          const argument = call.get('arguments')[0];
          t.assertStringLiteral(argument);

          argument.replaceWith(
            t.objectExpression([
              t.objectProperty(
                t.identifier('load'),
                t.arrowFunctionExpression(
                  [],
                  t.callExpression(t.identifier('import'), [argument.node])
                )
              ),
              t.objectProperty(
                t.identifier('moduleId'),
                t.callExpression(
                  t.memberExpression(
                    t.identifier('require'),
                    t.identifier('resolveWeak')
                  ),
                  [argument.node]
                )
              ),
            ])
          );
        });
      },
    },
  };
};
