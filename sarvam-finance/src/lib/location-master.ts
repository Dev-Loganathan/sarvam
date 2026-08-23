export interface CountryMaster {
  code: string;
  name: string;
  states: StateMaster[];
}

export interface StateMaster {
  code: string;
  name: string;
  cities: string[];
}
