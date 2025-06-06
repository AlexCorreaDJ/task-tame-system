
export interface Permission {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'granted' | 'denied' | 'prompt' | 'unknown';
  isRequired: boolean;
}
