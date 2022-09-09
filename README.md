<p align="right">
    <a href="https://github.com/castastrophe/latest-package/main/LICENSE" title="License Apache"><img src="https://img.shields.io/badge/license-Apache-blue?style=rounded-square"/></a>
    <a href="https://github.com/castastrophe/latest-package/releases"><img src="https://img.shields.io/badge/releases-latest-cyan?style=rounded-square"/></a>
</p>

```bash
yarn add -DW latest-package
```

## Contributing

```bash
git clone https://github.com/castastrophe/latest-package.git
cd latest-package
yarn install
```

The call to `yarn install` will setup everything you need for developing and
running the packages in this library.

## Linting

The project is linted on a pre-commit hook, but you can also run the lint suite
with `yarn lint`. It leverages ESLint and prettier.

<a name="testing"></a>

## Testing

Unit tests are run with ... These tests can be executed with:

```
yarn test
```

During development you may wish to use `yarn test:watch` to automatically build
and re-run the tests.

---

For additional details about the available commands, use `yarn run`. This will
list all commands available.
