# Detail Docker Instructions

## Build Docker locally

To build the docker image locally, simply run

```bash
docker build . --tag ghcr.io/ros-industrial/rmf2-ui/dashboard:local
```

Run the locally built dashboard

```bash
docker run -p 3000:80 --rm ghcr.io/ros-industrial/rmf2-ui/dashboard:local
```
