interface BootConfigurationItem {
  readonly path: string;
  readonly server?: false;
  readonly client?: false;
}

export type QuasarBootConfiguration = (string | BootConfigurationItem)[];
