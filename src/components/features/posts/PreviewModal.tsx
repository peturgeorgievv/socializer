import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import firebase from '../../../config/firebaseService';

type CommentData = any;

type ImgData = any;

type PreviewModalProps = {
  show: boolean;
  imgData: ImgData;
  currentUser: any;
  handleClose: any;
};

type PreviewModalState = {
  commentText: string;
  imgData: ImgData;
  commentData: CommentData;
}

class PreviewModal extends Component<PreviewModalProps, PreviewModalState> {
  state: any = {
    commentText: '',
    imgData: this.props.imgData,
    commentData: null,
  }

  componentDidUpdate = async (prevProps: any, prevState: any) => {
    if (prevProps === this.props) return;
    console.log(`entered`);

    const promises = this.props.imgData.comments.map((commentData: { userRef: { get: () => any; }; }, index: any) => {
      return commentData.userRef.get();
    });

    console.log(promises);
    const allDocuments = await Promise.all(promises);
    const users = allDocuments.map((document: any) => document.data());

    const commentData = this.props.imgData.comments.map((com: any, index: any) => {
      const newCom = {...com, user: users[index]};
      return newCom;
    });
    console.log(commentData);
    this.setState({ commentData })
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

  handleComment = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    // send to firebase comments -> commentLikes[] And to make it live
    this.refComments = firebase
      .firestore()
      .collection('posts')
      .doc(this.props.imgData.postId)
      .update({
        comments: firebase.firestore.FieldValue.arrayUnion({
          description: this.state.commentText,
          commentedBy: this.props.currentUser.documentId,
          userRef: firebase.firestore().doc(`users/${this.props.currentUser.documentId}`),
          firstName: this.props.currentUser.firstName,
          lastName: this.props.currentUser.lastName,
          createdOn: new Date().toLocaleString(),
          profilePhotoUrl: this.props.currentUser.profilePhotoUrl
        }),
      }).then(() => {
        this.props.imgData.comments.push({
          description: this.state.commentText,
          commentedBy: this.props.currentUser.documentId,
          userRef: firebase.firestore().doc(`users/${this.props.currentUser.documentId}`),
          firstName: this.props.currentUser.firstName,
          lastName: this.props.currentUser.lastName,
          createdOn: new Date().toLocaleString(),
          profilePhotoUrl: this.props.currentUser.profilePhotoUrl
        })
        this.setState({
          commentText: '',
          imgData: this.props.imgData
        });
      });
  }

  handleDeleteComment = (event: { preventDefault: () => void; }) => {
    event.preventDefault();

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
              <span>{this.props.imgData.comments && this.props.imgData.comments.length}</span>
            </div>
          </div>
          <div className="comments-section-container">
            <div className="comment-section-image-container">
              <div className="comment-section-image">
                <Link to={`/users/${this.props.imgData.uploadedBy}`}>
                  <img src={this.props.imgData.profilePhotoUrl} alt="avatar" />
                </Link>
              </div>
              <div>
                <Link to={`/users/${this.props.imgData.uploadedBy}`}>
                  <span>
                    <strong>{`${this.props.imgData.firstName} ${this.props.imgData.lastName}`}</strong>
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
            <div className="all-comments">
              { this.props.imgData.comments &&
                this.props.imgData.comments.length > 0 && 
                this.state.commentData && 
                this.state.commentData.map((commentData: { commentedBy: any; user: { profilePhotoUrl: string | undefined; }; firstName: any; lastName: any; createdOn: React.ReactNode; description: any; }, index: string | number | undefined) => {
                return (
                  <div key={index} className="single-comment">
                    <div className="single-comment-img-container">
                      <Link to={`/users/${commentData.commentedBy}`}>
                        <img src={commentData.user.profilePhotoUrl} alt="avatar" />
                      </Link>
                    </div>
                    <div>
                      <span className="delete-comment-icon"></span>
                      <span className="edit-comment-icon"></span>
                      <Link to={`/users/${commentData.commentedBy}`}>
                        <span>
                          <strong>
                            { `${commentData.firstName} ${commentData.lastName}` }
                          </strong>
                        </span>
                      </Link>
                      <span className="comment-date">{commentData.createdOn}</span>
                      <div className="comment-description">{`${commentData.description}`}</div>
                    </div>
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