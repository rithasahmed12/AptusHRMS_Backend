export interface JobInterface extends Document {
    title: string;
    description: string;
    requirements: string[];
    status: string;
    dynamicFields: {
      name: string;
      type: string;
      required: boolean;
      fileTypes: string[];
    }[];
    createdAt: Date;
  }