import React, { Component } from 'react';
import PreviewModal from './PreviewModal';
import firebase from '../../../config/firebaseService';

class Posts extends Component<any, any> {
  _isMounted: boolean;
  ref: any;
  unsubscribe: null;
  constructor(props: any) {
    super(props);
    this._isMounted = true;

    this.ref = firebase
      .firestore()
      .collection('posts')
      .where('status', '==', 'public');
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
      const { imgUrl, profilePhotoUrl, dateCreated, status, uploadedBy, title, description, comments, likes, postId, firstName, lastName } = img.data();
      posts.push({
        imgUrl,
        status,
        uploadedBy,
        title,
        description,
        comments,
        likes,
        postId,
        firstName,
        lastName,
        dateCreated,
        profilePhotoUrl
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
          {/* <PreviewModal 
            show={this.state.show}
            handleClose={this.hideModal}
            imgData={this.state.imgData}
          /> */}
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