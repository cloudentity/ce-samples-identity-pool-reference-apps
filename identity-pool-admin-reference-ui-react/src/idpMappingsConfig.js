const idpMappingsConfig = {
  attributes: [
    {
      name: 'user.payload.name',
      description: 'Name',
      type: 'string',
      labels: null
    },
    {
      name: 'user.payload.given_name',
      description: 'Given name',
      type: 'string',
      labels: null
    },
    {
      name: 'user.payload.family_name',
      description: 'Family name',
      type: 'string',
      labels: null
    },
    {
      name: 'email',
      description: 'Email',
      type: 'string',
      labels: null
    },
    {
      name: 'email_verified',
      description: 'Email verified',
      type: 'bool',
      labels: null
    },
    {
      name: 'phone_number',
      description: 'Phone number',
      type: 'string',
      labels: null
    },
    {
      name: 'phone_number_verified',
      description: 'Phone number verified',
      type: 'bool',
      labels: null
    },
    {
      name: 'user.user_pool_id',
      description: 'pool id',
      type: 'string',
      labels: null
    },
    {
      name: 'user.payload.roles',
      description: 'roles',
      type: 'string_array',
      labels: null
    },
    {
      name: 'user.id',
      description: 'useruuid',
      type: 'string',
      labels: null
    }
  ],
  mappings: [
    {
      source: 'user.payload.name',
      target: 'name',
      type: 'string',
      allow_weak_decoding: false
    },
    {
      source: 'user.payload.given_name',
      target: 'given_name',
      type: 'string',
      allow_weak_decoding: false
    },
    {
      source: 'user.payload.family_name',
      target: 'family_name',
      type: 'string',
      allow_weak_decoding: false
    },
    {
      source: 'email',
      target: 'email',
      type: 'string',
      allow_weak_decoding: false
    },
    {
      source: 'email_verified',
      target: 'email_verified',
      type: 'bool',
      allow_weak_decoding: false
    },
    {
      source: 'phone_number',
      target: 'phone_number',
      type: 'string',
      allow_weak_decoding: false
    },
    {
      source: 'phone_number_verified',
      target: 'phone_number_verified',
      type: 'bool',
      allow_weak_decoding: false
    },
    {
      source: 'user.user_pool_id',
      target: 'org',
      type: 'string',
      allow_weak_decoding: false
    },
    {
      source: 'user.payload.roles',
      target: 'roles',
      type: 'string_array',
      allow_weak_decoding: false
    },
    {
      source: 'user.id',
      target: 'useruuid',
      type: 'string',
      allow_weak_decoding: false
    }
  ],
  discovery_settings: {
    domains: [],
    instant_redirect: false
  }
};

export default idpMappingsConfig;
