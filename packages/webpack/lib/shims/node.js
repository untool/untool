import 'source-map-support/register';
import { getConfigAndMixins } from './loader';
import entryPoint from '@untool/entrypoint';

const { config, mixins } = getConfigAndMixins();

export default entryPoint(config, mixins);
