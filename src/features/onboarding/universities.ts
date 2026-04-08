export interface UniversityOption {
  university: string;
  campuses: string[];
}

export const UNIVERSITIES: UniversityOption[] = [
  {
    university: 'North-West University',
    campuses: ['Potchefstroom', 'Mahikeng', 'Vanderbijlpark'],
  },
  {
    university: 'University of Pretoria',
    campuses: ['Hatfield', 'Groenkloof', 'Mamelodi', 'Onderstepoort', 'Prinshof'],
  },
  {
    university: 'Stellenbosch University',
    campuses: ['Stellenbosch', 'Tygerberg', 'Bellville Park'],
  },
  {
    university: 'University of Cape Town',
    campuses: ['Upper Campus', 'Medical School', 'Hiddingh'],
  },
  {
    university: 'University of the Witwatersrand',
    campuses: ['Braamfontein', 'Parktown', 'Education Campus'],
  },
  {
    university: 'University of KwaZulu-Natal',
    campuses: ['Howard College', 'Westville', 'Pietermaritzburg', 'Medical School'],
  },
  {
    university: 'University of the Free State',
    campuses: ['Bloemfontein', 'QwaQwa', 'South Campus'],
  },
  {
    university: 'University of Johannesburg',
    campuses: ['Auckland Park', 'Doornfontein', 'Soweto'],
  },
];
