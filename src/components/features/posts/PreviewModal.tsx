import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import firebase from '../../../config/firebaseService';
import { CommentData } from '../../../models/posts/CommentData';
import { ImgData } from '../../../models/posts/ImgData';
import { UserData } from '../../../models/users/UserData';

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
  commentedUserData: any[]
}

class PreviewModal extends Component<any, PreviewModalState> {
  _isMounted: boolean

  constructor(props: any) {
    super(props);
    this._isMounted = true;
    
    this.state = {
      commentText: '',
      imgData: this.props.imgData,
      postUserData: null,
      commentData: [],
      commentedUserData: []
    }
  }

  
  componentDidUpdate = async (prevProps: PreviewModalProps, prevState: PreviewModalState) => {
    if (prevProps === this.props) return;
    if (this.props.imgData.uploadedBy) {
      firebase.firestore().collection('users').doc(this.props.imgData.uploadedBy).get().then((userSnapshot: any) => {
        this.setState({ postUserData: userSnapshot.data() });
      })
    }

    if (this.props.imgData.postId) {
      firebase.firestore().collection('comments')
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
            }

            firebase.firestore().collection('users').doc(this.state.commentData[counter].userId)
              .onSnapshot((querySnapshot: any) => {
                if (this._isMounted) {
                  this.setState((prevState: PreviewModalState) => ({
                    commentedUserData: [...prevState.commentedUserData, querySnapshot.data()],
                  }))
                }
              })
            counter++;
          })
        })
    }
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  // TO FIX CASE WHERE LIKE AND DISLIKE ARE JUST PUSHED TO LOCAL STATE
  handleLikeDislike = (event: any) => {
    this.refLikes = firebase
    .firestore()
    .collection('posts')
    .doc(this.props.imgData.postId);

    if (event.target.id === 'like-button') {
      this.refLikes.update({
        likes: firebase.firestore.FieldValue.arrayUnion({
          likedBy: this.props.currentUser.documentId,
          firstName: this.props.currentUser.firstName,
          lastName: this.props.currentUser.lastName
        })
      }).then(() => {
        if (!this.props.imgData.likes.find((user: { likedBy: any; }) => user.likedBy === this.props.currentUser.documentId)) {
          this.props.imgData.likes.push({
            likedBy: this.props.currentUser.documentId,
            firstName: this.props.currentUser.firstName,
            lastName: this.props.currentUser.lastName
          })
          this.setState({
            commentText: '',
            imgData: this.props.imgData
          });
        }
      })
    } else {
      this.refLikes.update({
        likes: firebase.firestore.FieldValue.arrayRemove({
          likedBy: this.props.currentUser.documentId,
          firstName: this.props.currentUser.firstName,
          lastName: this.props.currentUser.lastName
        })
      }).then(() => {
        this.props.imgData.likes = this.props.imgData.likes.filter((likeElement: { likedBy: any; }) => {
          return likeElement.likedBy !== this.props.currentUser.documentId;
        })
        this.setState({
          commentText: '',
          imgData: this.props.imgData
        });
      })
    }
  }

  handleComment = (event: any) => {
    event.preventDefault();
    this.refComments = firebase
      .firestore()
      .collection('comments')
      .add({
        postId: this.props.imgData.postId,
        description: this.state.commentText,
        createdOn: new Date().toLocaleString(),
        userId: this.props.currentUser.documentId
      }).then((commentData: any) => {
        firebase.firestore()
          .collection('comments')
          .doc(commentData.id)
          .set({ commentId: commentData.id }, { merge: true });
          if (this._isMounted) {
            this.setState({ commentText: '' });
          }
      });
  }

  handleDeleteComment = (commentId: string) => {
    firebase
      .firestore()
      .collection('comments')
      .doc(commentId)
      .delete();
  }

  handleChange = (event: { target: { value: any; }; }) => {
    this.setState({
      commentText: event.target.value,
    });
  }
  
  render = () => {
    const showHideClassName = this.props.show ? 'modal display-block' : 'modal display-none';
    const showHideUnlikeButton = 
      this.props.imgData.likes &&
      this.props.currentUser && 
      this.props.imgData.likes.find((user: { likedBy: any; }) => user.likedBy === this.props.currentUser.documentId) ? 'heart-icon-liked' : 'hide-button'; 
    const showHideLikeButton = 
      this.props.imgData.likes &&
      this.props.currentUser &&
      this.props.imgData.likes.find((user: { likedBy: any; }) => user.likedBy ===  this.props.currentUser.documentId) ? 'hide-button' : 'heart-icon-unliked'; 
    return (
      <div className={showHideClassName}>
        <section className="modal-main">
          <div className="image-container">
            <img className="post-img" src={this.props.imgData.imgUrl} alt="modal"/>
            <div className="like-comment-buttons-container">
              <span className={showHideLikeButton} id="like-button" onClick={this.handleLikeDislike}></span>
              <span className={showHideUnlikeButton} id="dislike-button" onClick={this.handleLikeDislike}></span>
              <span>{this.props.imgData.likes && this.props.imgData.likes.length}</span>
              <span className="comments-icon" id="comments-icon"></span>
              <span>{this.state.commentData && this.state.commentData.length}</span>
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
                <span className="title-date">{this.props.imgData.dateCreated}</span>
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
                  .sort((a: CommentData, b: CommentData) => (new Date(b.createdOn) as any) - (new Date(a.createdOn) as any))
                  .map((commentData: CommentData, index: number) => {
                const userData = this.state.commentedUserData.find((userData) => userData.documentId === commentData.userId);
                return (
                  <div key={index} className="single-comment">
                    { userData &&
                    <React.Fragment>
                      <div className="single-comment-img-container">
                        <Link to={`/users/${userData.documentId}`}>
                          <img src={userData.profilePhotoUrl} alt="avatar" />
                        </Link>
                      </div>
                      <div>
                        {(
                          this.props.currentUser.documentId === commentData.userId ||
                          this.props.currentUser.documentId === this.state.postUserData?.documentId
                        ) &&
                        <React.Fragment>
                          <span onClick={() => this.handleDeleteComment(commentData.commentId)} className="delete-comment-icon"></span>
                          <span className="edit-comment-icon"></span>
                        </React.Fragment>
                        }
                        <Link to={`/users/${userData.documentId}`}>
                          <span>
                            <strong>
                              { this.state.commentedUserData.length > 0 &&
                                userData &&
                              `${userData.firstName} ${userData.lastName}` }
                            </strong>
                          </span>
                        </Link>
                        <span className="comment-date">{commentData.createdOn}</span>
                        <div className="comment-description">{`${commentData.description}`}</div>
                      </div>
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
  refLikes: any;
  refComments: any;
}

const mapStateToProps = ({ currentUser }: any) => {
  return { currentUser }
}

export default connect(mapStateToProps)(PreviewModal);