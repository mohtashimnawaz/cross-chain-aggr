import { Idl } from '@coral-xyz/anchor';

export const IDL: Idl = {
  "address": "HeHD9gK7PC2tzxEVoL18eAz6EPLnXe7XY9CLnDCPeRiW",
  "metadata": {
    "name": "cross_chain_yield_aggregator",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claim_yield",
      "discriminator": [49, 74, 111, 7, 186, 22, 61, 165],
      "accounts": [
        {
          "name": "user_state",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [117, 115, 101, 114, 95, 115, 116, 97, 116, 101] },
              { "kind": "account", "path": "user" }
            ]
          }
        },
        {
          "name": "global_state",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101] }
            ]
          }
        },
        { "name": "user", "writable": true, "signer": true },
        { "name": "user_token_account", "writable": true },
        { "name": "vault", "writable": true },
        { "name": "token_program", "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "discriminator": [242, 35, 198, 137, 82, 225, 242, 182],
      "accounts": [
        {
          "name": "user_state",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [117, 115, 101, 114, 95, 115, 116, 97, 116, 101] },
              { "kind": "account", "path": "user" }
            ]
          }
        },
        {
          "name": "global_state",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101] }
            ]
          }
        },
        { "name": "user", "writable": true, "signer": true },
        { "name": "user_token_account", "writable": true },
        { "name": "vault", "writable": true },
        { "name": "token_program", "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": [{ "name": "amount", "type": "u64" }]
    },
    {
      "name": "withdraw",
      "discriminator": [183, 18, 70, 156, 148, 136, 159, 34],
      "accounts": [
        { "name": "user_state", "writable": true },
        { "name": "global_state", "writable": true },
        { "name": "user", "writable": true, "signer": true },
        { "name": "user_token_account", "writable": true },
        { "name": "vault", "writable": true },
        { "name": "token_program", "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }
      ],
      "args": [{ "name": "amount", "type": "u64" }]
    },
    {
      "name": "initialize",
      "discriminator": [175, 175, 109, 31, 13, 152, 155, 237],
      "accounts": [
        {
          "name": "global_state",
          "writable": true,
          "pda": {
            "seeds": [
              { "kind": "const", "value": [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101] }
            ]
          }
        },
        { "name": "authority", "writable": true, "signer": true },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "GlobalState",
      "discriminator": [175, 175, 109, 31, 13, 152, 155, 237]
    },
    {
      "name": "UserState",
      "discriminator": [183, 18, 70, 156, 148, 136, 159, 34]
    }
  ],
  "types": [
    {
      "name": "OracleData",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "sourceChain", "type": "u8" },
          { "name": "timestamp", "type": "i64" },
          { "name": "yieldRates", "type": { "array": ["u64", 10] } },
          { "name": "totalValueLocked", "type": "u64" },
          { "name": "apyData", "type": { "array": ["u64", 10] } }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InsufficientBalance",
      "msg": "Insufficient balance for withdrawal"
    },
    {
      "code": 6001,
      "name": "NoYieldToClaim",
      "msg": "No yield available to claim"
    },
    {
      "code": 6002,
      "name": "Unauthorized",
      "msg": "Unauthorized operation"
    }
  ]
}; 