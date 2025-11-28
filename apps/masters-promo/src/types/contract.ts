export interface ContractConfig {
  packages: {
    [key: string]: {
      application: string;
      areas: string[];
    };
  };
  'plugin-slug': string;
}
