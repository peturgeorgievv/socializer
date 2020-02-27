import React, { Component } from 'react';
import { connect } from 'react-redux';
import PreviewModal from './features/posts/PreviewModal';
import firebase from '../config/firebaseService';

class Home extends Component<any,any> {
  _isMounted: boolean;
  ref: any;
  unsubscribe: any;
  constructor(props: any) {
    super(props);
    this._isMounted = true;
    this.ref = firebase
      .firestore()
      .collection('posts');
    this.unsubscribe = null;
    this.state = {
      show: false,
      posts: [],
      imgData: [],
    }
  }
  componentDidMount = () => {
    this.ref = this.ref.onSnapshot(this.onCollectionUpdate);
    this.unsubscribe = this.ref;
  }

  componentWillUnmount = () => {
    this._isMounted = false;
    this.ref = null;
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
    if (this.props.currentUser) {
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
        if (
          status === 'public' ||
          uploadedBy === this.props.currentUser.documentId ||
          (status === 'private' &&
          this.props.currentUser &&
          this.props.currentUser.following &&
          this.props.currentUser.following.find((follower: any) => follower.userDocumentId === uploadedBy))
        ) {
          posts.push({
            imgUrl,
            status,
            uploadedBy,
            title,
            description,
            postId,
            dateCreated
          })
        }
      })
    }
    if (this._isMounted) {
      this.setState({
        posts
      })
    }
  }
  
  render = () => {
    return (
      <div className="posts-container">
        <PreviewModal 
          show={this.state.show}
          handleClose={this.hideModal}
          imgData={this.state.imgData}
        />
        { this.state.posts.length > 0 && this.state.posts.map((data: any, index: any) => {
          return (
            <div className="posts-container-img" key={index} onClick={() => this.showModal(data)}>
              <img src={data.imgUrl} alt="img" />
            </div>
          ) 
        })}
      </div>
    );
  }
}

const mapStateToProps = ({ currentUser }: any) => {
  return { currentUser }
}

export default connect(mapStateToProps)(Home);