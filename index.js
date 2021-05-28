const fastify = require("fastify");
const { Pool } = require("pg");
const redis = require("redis");

const nodeEnv = process.env.NODE_ENV || "development";
const redisURI = process.env.REDIS_URI || "localhost";

const redisClient = redis.createClient({
  host: redisURI,
});

const app = fastify({
  logger: true,
});

const pgConnect = async () => {
  const pool = new Pool();
  await pool.connect();
  return pool;
};

const getCacheDate = async (key = "") => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(result));
    });
  });
};

const saveCacheData = async (key = "", value = {}) => {
  return new Promise((resolve, reject) => {
    redisClient.setex(key, 60, JSON.stringify(value), (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
};

app.get('/', async () => {
  return {
    status: 'OK',
    nodeEnv
  }
})

app.get("/users", async (req) => {
  const { userId } = req.query;
  const pgPool = await pgConnect();
  const userKey = `users:${userId}`
  
  const dataFromCache = await getCacheDate(userKey)
  if(dataFromCache){
    return {
      function:"GET Cache users",
      userId,
      data:dataFromCache
    }
  }

  const result = await pgPool.query(`
    SELECT * FROM "users"
    WHERE id = '${userId}'
  `);

  const data = result.rows[0];
  await saveCacheData(userKey,data)

  return {
    function: "POST users2",
    userId,
    data,
  };
});

app.post("/users", async (req) => {
  const { username, name } = req.body;
  const pgPool = await pgConnect();

  const result = await pgPool.query(`
    INSERT INTO "users" ("username","name")
    VALUES('${username}','${name}')
    RETURNING *;
  `);

  const data = result.rows[0];

  return {
    function: "POST users",
    data,
  };
});

app.listen(3000, "0.0.0.0");
