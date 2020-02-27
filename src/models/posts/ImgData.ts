import { CommentData } from "./CommentData";

export type ImgData = {
  comments: CommentData[]
  likes: any[];
  dateCreated: string;
  description: string;
  firstName: string;
  lastName: string;
  imgUrl: string;
  postId: string;
  profilePhotoUrl: string;
  status: string;
  title: string;
  uploadedBy: string;
  userRef: any;
};