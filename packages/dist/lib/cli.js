#!/usr/bin/env node
'use strict';

require('@untool/yargs')
  .configure({ mixins: ['@untool/yargs/mixins/log'] })
  .run();
