import React, { Component } from 'react';
import PreviewModal from './PreviewModal';
import firebase from '../../../config/firebaseService';
import { POST_TYPE } from '../../../constants/post-type.constants';
import { COLLECTION } from '../../../constants/firebase-collections.constants';

type PostsProps = {}

type PropsState = {
  show: boolean;
  posts: any;
  imgData: any;
}

class Posts extends Component<PostsProps, PropsState> {
  _isMounted: boolean;
  ref: any;
  unsubscribe: null;
  constructor(props: PostsProps) {
    super(props);
    this._isMounted = true;

    this.ref = firebase
      .firestore()
      .collection(COLLECTION.posts)
      .where('status', '==', POST_TYPE.public);
    this.unsubscribe = null;
    this.state = {
      show: false,
      posts: null,
      imgData: [],
    }
  }

  componentDidMount = () => {
    this.ref = this.ref.onSnapshot(this.onCollectionUpdate);
    this.unsubscribe = this.ref;
  }

  componentWillUnmount = () => {
    this._isMounted = false;
    this.unsubscribe = null;
  }

  showModal = (imgData: any) => {
    this.setState({ 
      show: true,
      imgData,
     });
  };

  hideModal = () => {
    this.setState({ show: false });
  };

  onCollectionUpdate = (querySnapshot: any) => {
    const posts: any = [];
    querySnapshot.forEach((img: any) => {
      const {
        imgUrl,
        status,
        uploadedBy,
        title,
        description,
        postId,
        dateCreated
      } = img.data();
      
      posts.push({
        imgUrl,
        status,
        uploadedBy,
        title,
        description,
        postId,
        dateCreated
      })
    })
    if (this._isMounted) {
      this.setState({
        posts
      })
    }
  }
  
  render = () => {
    return (
      <React.Fragment>
          <PreviewModal 
            show={this.state.show}
            handleClose={this.hideModal}
            imgData={this.state.imgData}
          />
          <div className="posts-container">
            { this.state.posts && 
              this.state.posts.length > 0 &&
              this.state.posts.map((data: any, index: any) => {
              return (
                <div className="posts-container-img" key={index} onClick={() => this.showModal(data)}>
                  <img src={data.imgUrl} alt="img" />
                </div>
              ) 
            })}
          </div>
        </React.Fragment>
    );
  }
}

export default Posts;