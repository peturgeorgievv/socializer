import React, { Component } from 'react';
import { connect } from 'react-redux';
import PreviewModal from './features/posts/PreviewModal';
import firebase from '../config/firebaseService';
import { ImgData } from '../models/posts/ImgData';
import { COLLECTION } from '../constants/firebase-collections.constants';
import { POST_TYPE } from '../constants/post-type.constants';

type HomeProps = {
  currentUser: any;
}

type HomeState = {
  show: boolean;
  posts: any[];
  imgData: any;
}

class Home extends Component<HomeProps, HomeState> {
  _isMounted: boolean;
  ref: any;
  unsubscribe: any;

  constructor(props: any) {
    super(props);
    this._isMounted = true;
    this.ref = null;
    this.unsubscribe = null;
    this.state = {
      show: false,
      posts: [],
      imgData: [],
    }
  }

  componentDidMount = (): void => {
    this.ref = firebase
      .firestore()
      .collection(COLLECTION.posts);
    this.ref = this.ref.onSnapshot(this.onCollectionUpdate);
    this.unsubscribe = this.ref;
  }

  componentDidUpdate = async (prevProps: HomeProps, prevState: HomeState) => {
    if (prevProps.currentUser) return;
    if (this.props.currentUser) {
      this.ref = firebase
        .firestore()
        .collection(COLLECTION.posts)
        .onSnapshot(this.onCollectionUpdate);
    }
  }

  componentWillUnmount = (): void => {
    this._isMounted = false;
    this.ref = null;
    this.unsubscribe = null;
  }
  
  showModal = (imgData: ImgData): void => {
    if (!this._isMounted) return;
    this.setState({ 
      show: true,
      imgData,
     });
  };

  hideModal = (): void => {
    if (!this._isMounted) return;
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
          status === POST_TYPE.public ||
          uploadedBy === this.props.currentUser.documentId ||
          (status === POST_TYPE.private &&
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
        {this.state.show && <PreviewModal 
          show={this.state.show}
          handleClose={this.hideModal}
          imgData={this.state.imgData}
        />}
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