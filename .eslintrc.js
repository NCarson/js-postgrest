module.exports = {
    "settings": {
    },
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:import/errors"
    ],
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "plugins": [
    ],
    "rules": {
        //mine
        "import/no-unresolved": "warn",
        "no-unused-vars": "warn",
        "no-unsafe-finally": "off",
        "no-console": "off",
        "multiline-ternary": "off",
        "no-implicit-coercion": "off",
        "object-property-newline": "off",
        "no-unneeded-ternary": "off",
        "no-floating-decimal": "off",
        "max-lines-per-function": "off",
        "no-mixed-spaces-and-tabs": "off"
        //endmine
    }
};
