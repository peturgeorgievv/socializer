import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import firebase from '../../../config/firebaseService';
import { CommentData } from '../../../models/posts/CommentData';
import { ImgData } from '../../../models/posts/ImgData';
import { UserData } from '../../../models/users/UserData';
import { toastr } from 'react-redux-toastr';
import SingleComment from './SingleComment';
import { COLLECTION } from '../../../constants/firebase-collections.constants';
import moment from 'moment';
import { DATE_COMMENTS_FORMAT } from '../../../constants/date.constants';
import { compareDates } from '../../../utils/date-utils';
import { DATE_ORDER } from '../../../enums/date.enum';

type PreviewModalProps = {
  show: boolean;
  imgData: ImgData;
  currentUser: any;
  handleClose: any;
};

type PreviewModalState = {
  commentText: string;
  imgData: ImgData;
  postUserData: UserData | null;
  commentData: CommentData[];
  commentedUserData: any[];
  likesData: any[];
  showForm: boolean;
}

class PreviewModal extends Component<PreviewModalProps, PreviewModalState> {
  _isMounted: boolean;
  refLikes: any;
  refComments: any;

  constructor(props: PreviewModalProps) {
    super(props);
    this._isMounted = true;
    
    this.state = {
      commentText: '',
      imgData: this.props.imgData,
      postUserData: null,
      commentData: [],
      commentedUserData: [],
      likesData: [],
      showForm: false,
    }
  }

  componentDidUpdate = async (prevProps: PreviewModalProps, prevState: PreviewModalState) => {
    if (prevProps === this.props) return;
    if (this.props.imgData.uploadedBy) {
      firebase.firestore()
        .collection(COLLECTION.users)
        .doc(this.props.imgData.uploadedBy)
        .get()
        .then((userSnapshot: any) => {
          if (this._isMounted) {
            this.setState({ postUserData: userSnapshot.data() });
          }
      })
    }

    if (this.props.imgData.postId) {
      firebase.firestore().collection(COLLECTION.comments)
        .where('postId', '==', this.props.imgData.postId)
        .onSnapshot((querySnapshot: any) => {
          if (this._isMounted) {
            this.setState({ commentData: [] });
          }
          let counter = 0;
          querySnapshot.forEach((comment: any) => {
            if (this._isMounted) {
              this.setState((prevState: PreviewModalState) => ({
                  commentData: [...prevState.commentData, comment.data()],
              }));

              firebase.firestore().collection(COLLECTION.users).doc(this.state.commentData[counter].userId)
                .onSnapshot((querySnapshot: any) => {
                  this.setState((prevState: PreviewModalState) => ({
                    commentedUserData: [...prevState.commentedUserData, querySnapshot.data()],
                  }))
                })
              }
            counter++;
          })
        })
      firebase.firestore().collection(COLLECTION.likes)
        .where('postId', '==', this.props.imgData.postId)
        .onSnapshot((querySnapshot: any) => {
          if (this._isMounted) {
            this.setState({ likesData: [] });
          }
          querySnapshot.forEach((like: any) => {
            this.setState((prevState: PreviewModalState) => ({
              likesData: [...prevState.likesData, like.data()],
            }));
          })
        })
    }
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  handleLikeDislike = (event: any) => {
    if (!this.props.currentUser) return;
    if (event.target.id === 'like-button') {
    this.refLikes = firebase
      .firestore()
      .collection(COLLECTION.likes)
      .add({
        postId: this.props.imgData.postId,
        userId: this.props.currentUser.documentId
      }).then((likeData: any) => {
        firebase.firestore()
          .collection(COLLECTION.likes)
          .doc(likeData.id)
          .set({ likeId: likeData.id }, { merge: true });
        toastr.info('Liked', this.props.imgData.title);
      });
    } else {
      const likeData = this.state.likesData.find(like => like.userId === this.props.currentUser.documentId);
      console.log(likeData);
      this.refLikes = firebase
      .firestore()
      .collection(COLLECTION.likes)
      .doc(likeData.likeId)
      .delete();
      toastr.info('Unliked', this.props.imgData.title);
    }
  }

  handleComment = (event: any) => {
    event.preventDefault();
    if (!this.props.currentUser) {
      toastr.warning('Please Login First', '');
      return;
    };
    
    this.refComments = firebase
      .firestore()
      .collection(COLLECTION.comments)
      .add({
        postId: this.props.imgData.postId,
        description: this.state.commentText,
        createdOn: moment().format(DATE_COMMENTS_FORMAT),
        userId: this.props.currentUser.documentId
      }).then((commentData: any) => {
        firebase.firestore()
          .collection(COLLECTION.comments)
          .doc(commentData.id)
          .set({ commentId: commentData.id }, { merge: true });
          if (this._isMounted) {
            this.setState({ commentText: '' });
          }
          toastr.info('Added comment to', this.props.imgData.title);
      });
  }

  handleDeletePost = () => {
    // Deletes all comments from the post
    firebase
    .firestore()
    .collection(COLLECTION.comments)
    .where('postId', '==', this.props.imgData.postId)
    .get().then(data => {
      data.forEach(querySnapshot => {
        querySnapshot.ref.delete();
      })
    });

    // Deletes all likes to the post
    firebase
    .firestore()
    .collection(COLLECTION.likes)
    .where('postId', '==', this.props.imgData.postId)
    .get().then(data => {
      data.forEach(querySnapshot => {
        querySnapshot.ref.delete();
      })
    });

    // Deletes image from posts collection
    firebase.firestore().collection(COLLECTION.posts).doc(this.props.imgData.postId).delete();

    // Deletes image from storage
    firebase.storage().refFromURL(this.props.imgData.imgUrl).delete().then(() => {
      toastr.error('Deleted post with title:', this.props.imgData.title);
      this.props.handleClose();
    });
  }

  handleChange = (event: any) => {
    this.setState({
      commentText: event.target.value
    });
  }
  
  render = () => {
    const showHideClassName = this.props.show ? 'modal display-block' : 'modal display-none';
    const showHideUnlikeButton = 
    this.props.currentUser && 
    this.state.likesData.length > 0 &&
    this.state.likesData.find((like: any) => like.userId === this.props.currentUser.documentId) ? 'heart-icon-liked' : 'hide-button'; 
    const showHideLikeButton = 
    this.props.currentUser &&
    this.state.likesData.length > 0 &&
    this.state.likesData.find((like: any) => like.userId ===  this.props.currentUser.documentId) ? 'hide-button' : 'heart-icon-unliked'; 
    return (
      <div className={showHideClassName}>
        <section className="modal-main">
          <div className="image-container">
            <img className="post-img" src={this.props.imgData.imgUrl} alt="modal"/>
            <div className="like-comment-buttons-container">
              <span className={showHideLikeButton} id="like-button" onClick={this.handleLikeDislike}></span>
              <span className={showHideUnlikeButton} id="dislike-button" onClick={this.handleLikeDislike}></span>
              <span className="count-number">{this.state.likesData && this.state.likesData.length}</span>
              <span className="comments-icon" id="comments-icon"></span>
              <span className="count-number">{this.state.commentData && this.state.commentData.length}</span>
              { this.props.imgData && this.props.currentUser &&
                this.props.imgData.uploadedBy === this.props.currentUser.documentId && 
                <span className="delete-post" onClick={this.handleDeletePost}>
                  <span className="delete-post-icon" id="delete-post-icon"></span>
                  <span>Delete Post</span>
                </span>
              }
            </div>
          </div>
          <div className="comments-section-container">
            {this.state.postUserData &&
            <div className="comment-section-image-container">
              <div className="comment-section-image">
                <Link to={`/users/${this.state.postUserData.documentId}`}>
                  <img src={this.state.postUserData.profilePhotoUrl} alt="avatar" />
                </Link>
              </div>
              <div>
                <Link to={`/users/${this.state.postUserData.documentId}`}>
                  <span>
                    <strong>{`${this.state.postUserData.firstName} ${this.state.postUserData.lastName}`}</strong>
                  </span>
                </Link>
                <span className="title-date">{moment(this.props.imgData.dateCreated).format(DATE_COMMENTS_FORMAT)}</span>
                <div className="img-title">{this.props.imgData.title}</div>
                <div className="img-description">{this.props.imgData.description}</div>
                <form className="comment-form" onSubmit={this.handleComment}>
                  <input 
                    type="textarea"
                    value={this.state.commentText} 
                    onChange={this.handleChange}
                    placeholder="Write comment..."
                  />
                  <button type="submit"><span className="add-comment-icon"></span></button>
                </form>
              </div>
            </div>
            }
            <div className="all-comments">
              { this.state.commentData.length > 0 &&
                this.state.commentData
                  .sort((a: CommentData, b: CommentData) => { 
                    return compareDates(a.createdOn, b.createdOn, DATE_ORDER.asc);
                  })
                  .map((commentData: CommentData, index: number) => {
                const userData = this.state.commentedUserData.find((userData) => userData.documentId === commentData.userId);
                return (
                  <div key={index} className="single-comment">
                    { userData &&
                    <React.Fragment>
                      <SingleComment 
                        commentData={commentData}
                        userData={userData}
                        postUserData={this.state.postUserData}
                        commentedUserData={this.state.commentedUserData}
                      />
                    </React.Fragment>
                    }
                  </div>
                )
              })}
            </div>
          </div>
          <button className="close-modal" onClick={this.props.handleClose}>
            <span className="close-modal-icon"></span>
          </button>
        </section>
      </div>
    );
  }
}

const mapStateToProps = ({ currentUser }: any) => {
  return { currentUser }
}

export default connect(mapStateToProps)(PreviewModal);