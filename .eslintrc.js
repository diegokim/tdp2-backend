module.exports = {
  "env": {
      "es6": true,
      "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
      "sourceType": "module",
      "ecmaVersion": 6,
      "ecmaFeatures": {
          "jsx": true
      }
  },
  "rules": {
    "key-spacing": ["error", { "mode": "minimum" }],
    "accessor-pairs": "error",
    "array-bracket-spacing": "error",
    "array-callback-return": "error",
    "arrow-body-style": "error",
    "arrow-parens": "error",
    "arrow-spacing": [
        "error",
        {
            "after": true,
            "before": true
        }
    ],
    "block-scoped-var": "error",
    "block-spacing": [
        "error",
        "always"
    ],
    "brace-style": [
        "error",
        "1tbs",
        {
            "allowSingleLine": true
        }
    ],
    "callback-return": "error",
    "camelcase": "error",
    "capitalized-comments": "off",
    "class-methods-use-this": "error",
    "comma-dangle": "error",
    "comma-spacing": [
        "error",
        {
            "after": true,
            "before": false
        }
    ],
    "comma-style": [
        "error",
        "last"
    ],
    "complexity": "error",
    "computed-property-spacing": "error",
    "consistent-return": "off",
    "consistent-this": "error",
    "curly": "error",
    "default-case": "error",
    "dot-location": [
        "error",
        "property"
    ],
    "dot-notation": [
        "error",
        {
            "allowKeywords": true
        }
    ],
    "eol-last": "error",
    "eqeqeq": "error",
    "func-call-spacing": "error",
    "func-name-matching": "error",
    "func-names": [
        "error",
        "never"
    ],
    "func-style": [
        "error",
        "expression"
    ],
    "generator-star-spacing": "error",
    "global-require": "error",
    "guard-for-in": "error",
    "handle-callback-err": "error",
    "id-blacklist": "error",
    "id-length": "off",
    "id-match": "error",
    "indent": ["error", 2, { "VariableDeclarator": 1 }],
    "init-declarations": "off",
    "jsx-quotes": "error",
    "keyword-spacing": [
        "error",
        {
            "after": true,
            "before": true
        }
    ],
    "line-comment-position": "off",
    "linebreak-style": [
        "error",
        "unix"
    ],
    "lines-around-comment": "error",
    "lines-around-directive": "error",
    "max-depth": "error",
    "max-len": "off",
    "max-lines": "off",
    "max-nested-callbacks": "error",
    "max-params": "off",
    "max-statements": "off",
    "max-statements-per-line": "error",
    "multiline-ternary": [
        "off",
        "never"
    ],
    "new-parens": "error",
    "newline-after-var": "off",
    "newline-before-return": "off",
    "newline-per-chained-call": "off",
    "no-alert": "error",
    "no-array-constructor": "error",
    "no-await-in-loop": "error",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-catch-shadow": "error",
    "no-compare-neg-zero": "error",
    "no-confusing-arrow": "off",
    "no-continue": "error",
    "no-console": "off",
    "no-div-regex": "error",
    "no-duplicate-imports": "error",
    "no-else-return": "off",
    "no-empty-function": "error",
    "no-eq-null": "error",
    "no-eval": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-extra-label": "error",
    "no-extra-parens": "off",
    "no-floating-decimal": "error",
    "no-implicit-coercion": "error",
    "no-implicit-globals": "error",
    "no-implied-eval": "error",
    "no-inline-comments": "off",
    "no-invalid-this": "error",
    "no-iterator": "error",
    "no-label-var": "error",
    "no-labels": "error",
    "no-lone-blocks": "error",
    "no-lonely-if": "error",
    "no-loop-func": "error",
    "no-magic-numbers": "off",
    "no-mixed-operators": "error",
    "no-mixed-requires": "error",
    "no-mixed-spaces-and-tabs": "off",
    "no-multi-assign": "error",
    "no-multi-spaces": "error",
    "no-multi-str": "error",
    "no-multiple-empty-lines": "error",
    "no-native-reassign": "error",
    "no-negated-condition": "error",
    "no-negated-in-lhs": "error",
    "no-nested-ternary": "error",
    "no-new": "error",
    "no-new-func": "error",
    "no-new-object": "error",
    "no-new-require": "error",
    "no-new-wrappers": "error",
    "no-octal-escape": "error",
    "no-param-reassign": "error",
    "no-path-concat": "error",
    "no-plusplus": "error",
    "no-process-env": "off",
    "no-process-exit": "error",
    "no-proto": "error",
    "no-prototype-builtins": "error",
    "no-restricted-globals": "error",
    "no-restricted-imports": "error",
    "no-restricted-modules": "error",
    "no-restricted-properties": "error",
    "no-restricted-syntax": "error",
    "no-return-assign": "error",
    "no-return-await": "error",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-shadow": "off",
    "no-shadow-restricted-names": "error",
    "no-spaced-func": "error",
    "no-sync": "error",
    "no-tabs": "off",
    "no-template-curly-in-string": "error",
    "no-ternary": "off",
    "no-throw-literal": "error",
    "no-trailing-spaces": "error",
    "no-undef": "error",
    "no-undef-init": "error",
    "no-undefined": "off",
    "no-underscore-dangle": "off",
    "no-unmodified-loop-condition": "error",
    "no-unneeded-ternary": "error",
    "no-unused-expressions": "error",
    "no-use-before-define": "error",
    "no-useless-call": "error",
    "no-useless-computed-key": "error",
    "no-useless-concat": "error",
    "no-useless-constructor": "error",
    "no-useless-escape": "error",
    "no-useless-rename": "error",
    "no-useless-return": "error",
    "no-var": "error",
    "no-void": "error",
    "no-warning-comments": "error",
    "no-whitespace-before-property": "error",
    "no-with": "error",
    "nonblock-statement-body-position": "error",
    "object-curly-newline": "off",
    "object-curly-spacing": [
        "off",
        "never"
    ],
    "object-property-newline": [
        "error",
        {
            "allowMultiplePropertiesPerLine": true
        }
    ],
    "object-shorthand": "off",
    "one-var": "off",
    "one-var-declaration-per-line": "error",
    "operator-assignment": "error",
    "operator-linebreak": "off",
    "padded-blocks": "off",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prefer-numeric-literals": "error",
    "prefer-promise-reject-errors": "off",
    "prefer-reflect": "off",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "prefer-template": "off",
    "quote-props": "off",
    "quotes": [
        "error",
        "single"
    ],
    "radix": "error",
    "require-await": "error",
    "require-jsdoc": "error",
    "rest-spread-spacing": "error",
    "semi": "off",
    "semi-spacing": "error",
    "sort-imports": "error",
    "sort-keys": "off",
    "sort-vars": "error",
    "space-before-blocks": "error",
    "space-before-function-paren": "error",
    "space-in-parens": [
        "error",
        "never"
    ],
    "space-infix-ops": "error",
    "space-unary-ops": "error",
    "spaced-comment": [
        "off"
    ],
    "strict": "error",
    "symbol-description": "error",
    "template-curly-spacing": "error",
    "template-tag-spacing": "error",
    "unicode-bom": [
        "error",
        "never"
    ],
    "valid-jsdoc": "off",
    "vars-on-top": "error",
    "wrap-iife": "error",
    "wrap-regex": "error",
    "yield-star-spacing": "error",
    "yoda": "error"
  }
};
