export class Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  constructor(
    street: string = '',
    city: string = '',
    state: string = '',
    zipCode: string = '',
    country: string = ''
  ) {
    this.street = street;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.country = country;
  }
}

export class User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  addresses: Address[];
  
  constructor(
    id: number = 0,
    firstName: string = '',
    lastName: string = '',
    email: string = '',
    phoneNumber: string = '',
    addresses: Address[] = []
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.addresses = addresses;
  }
}
