# Detail Docker Instructions

## Build Docker locally

First remove locally installed dependencies.
Including them in the docker build step might cause symlinks to break.
This may cause the docker build to hang or fail.

`PNPM` doesn't really have a clean command (https://github.com/pnpm/pnpm/issues/6816).
We can only do this manually using `rm -rf`.

Here is a 1 liner command to remove the installed dependencies.

```bash
find -type d -name "node_modules" -exec rm -rf {} >/dev/null 2>&1 \;
```

To build the docker image locally, simply run

```bash
docker build . --tag registry.gitlab.com/rosi-ap/rmf2/rmf2-ui/dashboard:latest
```

To install the dependencies back, run

```bash
pnpm install
```
