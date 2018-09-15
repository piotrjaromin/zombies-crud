# Zombies crud

to run

```
npm start
```

to run unit tests

```
npm run test
```

to run integration tests

```
npm start
npm run test-integration
```

## Info

All zombies are stored in memory.
Call to market is behind cache which is refreshed every minute (could be replaced with crone launched at given time of day)
Call to npb is not cached that is why it may return 404 when there is no updated data for today. In such case prices for items will not be calculated.

