// TypeScript interfaces for API data

export interface User {
  _id: string;
  email: string;
  // Add more fields as needed
}

export interface Recipe {
  _id: string;
  title: string;
  images: string[];
  createdBy?: { email?: string } | string;
  cookTime?: number;
  ingredients?: string[] | string;
  description?: string;
  likes?: number;
  ethnicity?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
