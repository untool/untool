'use strict';

module.exports = ({ types: t }) => ({
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

        let importedComponent;
        let load;

        if (t.isStringLiteral(argument)) {
          importedComponent = argument.node;
          load = t.arrowFunctionExpression(
            [],
            t.callExpression(t.identifier('import'), [importedComponent])
          );
        } else {
          t.assertArrowFunctionExpression(argument);
          argument.traverse({
            Import(path) {
              importedComponent = path.parentPath.get('arguments')[0].node;
            },
          });

          load = argument.node;
        }

        argument.replaceWith(
          t.objectExpression([
            t.objectProperty(t.identifier('load'), load),
            t.objectProperty(
              t.identifier('moduleId'),
              t.callExpression(
                t.memberExpression(
                  t.identifier('require'),
                  t.identifier('resolveWeak')
                ),
                [importedComponent]
              )
            ),
          ])
        );
      });
    },
  },
});
