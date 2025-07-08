export const idlFactory = ({ IDL }) => {
  const User = IDL.Record({
    'principal' : IDL.Principal,
    'username' : IDL.Opt(IDL.Text),
    'created_at' : IDL.Nat64,
  });
  return IDL.Service({
    'get_my_user' : IDL.Func(
        [],
        [IDL.Opt(IDL.Tuple(IDL.Text, IDL.Nat64))],
        ['query'],
      ),
    'get_or_register_user' : IDL.Func([], [User], []),
  });
};
export const init = ({ IDL }) => { return []; };
