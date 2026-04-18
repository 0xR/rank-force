import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);
import { fileURLToPath as topLevelFileUrlToPath, URL as topLevelURL } from "url"
const __filename = topLevelFileUrlToPath(import.meta.url)
const __dirname = topLevelFileUrlToPath(new topLevelURL(".", import.meta.url))

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/shared/type-assertions.ts
function assertIsString(value) {
  if (typeof value !== "string") {
    throw new Error("Not a string");
  }
}
__name(assertIsString, "assertIsString");
function assertIsNonEmptyString(value) {
  assertIsString(value);
  if (value === "") {
    throw new Error("Empty string");
  }
}
__name(assertIsNonEmptyString, "assertIsNonEmptyString");
function assertIsObject(input) {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Not an object");
  }
}
__name(assertIsObject, "assertIsObject");

// node_modules/.pnpm/ulid@2.3.0/node_modules/ulid/dist/index.esm.js
function createError(message) {
  var err = new Error(message);
  err.source = "ulid";
  return err;
}
__name(createError, "createError");
var ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
var ENCODING_LEN = ENCODING.length;
var TIME_MAX = Math.pow(2, 48) - 1;
var TIME_LEN = 10;
var RANDOM_LEN = 16;
function randomChar(prng) {
  var rand = Math.floor(prng() * ENCODING_LEN);
  if (rand === ENCODING_LEN) {
    rand = ENCODING_LEN - 1;
  }
  return ENCODING.charAt(rand);
}
__name(randomChar, "randomChar");
function encodeTime(now, len) {
  if (isNaN(now)) {
    throw new Error(now + " must be a number");
  }
  if (now > TIME_MAX) {
    throw createError("cannot encode time greater than " + TIME_MAX);
  }
  if (now < 0) {
    throw createError("time must be positive");
  }
  if (Number.isInteger(now) === false) {
    throw createError("time must be an integer");
  }
  var mod = void 0;
  var str = "";
  for (; len > 0; len--) {
    mod = now % ENCODING_LEN;
    str = ENCODING.charAt(mod) + str;
    now = (now - mod) / ENCODING_LEN;
  }
  return str;
}
__name(encodeTime, "encodeTime");
function encodeRandom(len, prng) {
  var str = "";
  for (; len > 0; len--) {
    str = randomChar(prng) + str;
  }
  return str;
}
__name(encodeRandom, "encodeRandom");
function decodeTime(id) {
  if (id.length !== TIME_LEN + RANDOM_LEN) {
    throw createError("malformed ulid");
  }
  var time = id.substr(0, TIME_LEN).split("").reverse().reduce(function(carry, char, index) {
    var encodingIndex = ENCODING.indexOf(char);
    if (encodingIndex === -1) {
      throw createError("invalid character found: " + char);
    }
    return carry += encodingIndex * Math.pow(ENCODING_LEN, index);
  }, 0);
  if (time > TIME_MAX) {
    throw createError("malformed ulid, timestamp too large");
  }
  return time;
}
__name(decodeTime, "decodeTime");
function detectPrng() {
  var allowInsecure = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
  var root = arguments[1];
  if (!root) {
    root = typeof window !== "undefined" ? window : null;
  }
  var browserCrypto = root && (root.crypto || root.msCrypto);
  if (browserCrypto) {
    return function() {
      var buffer = new Uint8Array(1);
      browserCrypto.getRandomValues(buffer);
      return buffer[0] / 255;
    };
  } else {
    try {
      var nodeCrypto = __require("crypto");
      return function() {
        return nodeCrypto.randomBytes(1).readUInt8() / 255;
      };
    } catch (e) {
    }
  }
  if (allowInsecure) {
    try {
      console.error("secure crypto unusable, falling back to insecure Math.random()!");
    } catch (e) {
    }
    return function() {
      return Math.random();
    };
  }
  throw createError("secure crypto unusable, insecure Math.random not allowed");
}
__name(detectPrng, "detectPrng");
function factory(currPrng) {
  if (!currPrng) {
    currPrng = detectPrng();
  }
  return /* @__PURE__ */ __name(function ulid2(seedTime) {
    if (isNaN(seedTime)) {
      seedTime = Date.now();
    }
    return encodeTime(seedTime, TIME_LEN) + encodeRandom(RANDOM_LEN, currPrng);
  }, "ulid");
}
__name(factory, "factory");
var ulid = factory();

// src/shared/MqttToken.tsx
function assertIsToken(parsed) {
  assertIsObject(parsed);
  assertIsNonEmptyString(parsed.sessionId);
  assertIsNonEmptyString(parsed.userId);
}
__name(assertIsToken, "assertIsToken");
function validateToken(token) {
  decodeTime(token.sessionId);
  decodeTime(token.userId);
}
__name(validateToken, "validateToken");

// node_modules/.pnpm/sst@3.0.37_aws-crt@1.21.3/node_modules/sst/dist/aws/realtime.js
var realtime;
(function(realtime2) {
  function authorizer(input) {
    return async (evt, context) => {
      const [, , , region, accountId] = context.invokedFunctionArn.split(":");
      const token = Buffer.from(evt.protocolData.mqtt?.password ?? "", "base64").toString();
      const ret = await input(token);
      return {
        isAuthenticated: true,
        principalId: Date.now().toString(),
        disconnectAfterInSeconds: 86400,
        refreshAfterInSeconds: 300,
        policyDocuments: [
          {
            Version: "2012-10-17",
            Statement: [
              {
                Action: "iot:Connect",
                Effect: "Allow",
                Resource: "*"
              },
              ...ret.subscribe ? [
                {
                  Action: "iot:Receive",
                  Effect: "Allow",
                  Resource: ret.subscribe.map((t) => `arn:aws:iot:${region}:${accountId}:topic/${t}`)
                }
              ] : [],
              ...ret.subscribe ? [
                {
                  Action: "iot:Subscribe",
                  Effect: "Allow",
                  Resource: ret.subscribe.map((t) => `arn:aws:iot:${region}:${accountId}:topicfilter/${t}`)
                }
              ] : [],
              ...ret.publish ? [
                {
                  Action: "iot:Publish",
                  Effect: "Allow",
                  Resource: ret.publish.map((t) => `arn:aws:iot:${region}:${accountId}:topic/${t}`)
                }
              ] : []
            ]
          }
        ]
      };
    };
  }
  __name(authorizer, "authorizer");
  realtime2.authorizer = authorizer;
})(realtime || (realtime = {}));

// src/function/realtime-authorizer.ts
var handler = realtime.authorizer(async (token) => {
  console.log("Authorizing token:", token);
  const parsed = JSON.parse(token);
  assertIsToken(parsed);
  validateToken(parsed);
  const topic = `${process.env.SST_TOPIC_PREFIX}${parsed.sessionId}`;
  return {
    subscribe: [topic],
    publish: [topic]
  };
});
export {
  handler
};
//# sourceMappingURL=bundle.mjs.map
