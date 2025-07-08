import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface User {
  'principal' : Principal,
  'username' : [] | [string],
  'created_at' : bigint,
}
export interface _SERVICE {
  'get_my_user' : ActorMethod<[], [] | [[string, bigint]]>,
  'get_or_register_user' : ActorMethod<[], User>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
