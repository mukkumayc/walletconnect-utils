import * as ed25519 from "@stablelib/ed25519";
import { randomBytes } from "@stablelib/random";
import {
  JWT_IRIDIUM_ALG,
  JWT_IRIDIUM_TYP,
  KEY_PAIR_SEED_LENGTH,
} from "./constants";

import {
  decodeIss,
  decodeJWT,
  encodeData,
  encodeIss,
  encodeJWT,
} from "./utils";

export function generateKeyPair(
  seed: Uint8Array = randomBytes(KEY_PAIR_SEED_LENGTH)
): ed25519.KeyPair {
  return ed25519.generateKeyPairFromSeed(seed);
}

export async function signJWT(subject: string, keyPair: ed25519.KeyPair) {
  const header = { alg: JWT_IRIDIUM_ALG, typ: JWT_IRIDIUM_TYP };
  const issuer = encodeIss(keyPair.publicKey);
  const payload = { iss: issuer, sub: subject };
  const data = encodeData({ header, payload });
  const signature = ed25519.sign(keyPair.secretKey, data);
  return encodeJWT({ header, payload, signature });
}

export async function verifyJWT(jwt: string) {
  const { header, payload, signature } = decodeJWT(jwt);
  if (header.alg !== JWT_IRIDIUM_ALG || header.typ !== JWT_IRIDIUM_TYP) {
    throw new Error("JWT must use EdDSA algorithm");
  }
  const publicKey = decodeIss(payload.iss);
  const data = encodeData({ header, payload });
  return ed25519.verify(publicKey, data, signature);
}