import React, { Component } from 'react';
import { connect } from 'react-redux'
import { toastr } from 'react-redux-toastr';
import firebase from '../../../config/firebaseService';
import { CommentData } from '../../../models/posts/CommentData';
import { UserData } from '../../../models/users/UserData';
import { Link } from 'react-router-dom';
import { COLLECTION } from '../../../constants/firebase-collections.constants';

type SingleCommentState = {
  description: string;
  showForm: boolean;
}

type SingleCommentProps = {
  currentUser: any;
  userData: any;
  commentData: CommentData;
  postUserData: UserData | null;
  commentedUserData: any[];
}

class SingleComment extends Component<SingleCommentProps, SingleCommentState> {
  _isMounted: boolean;

  constructor(props: any) {
    super(props);
    this._isMounted = true;
    
    this.state = {
      description: this.props.commentData.description,
      showForm: false,
    };
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  handleSubmit = (event: any) => {
    event.preventDefault();
    if (!this.props.currentUser) return;
    firebase
      .firestore()
      .collection(COLLECTION.comments)
      .doc(this.props.commentData.commentId)
      .set({
        description: this.state.description
      }, { merge: true })
      .then(() => {
        toastr.info('Edited comment', this.state.description);
        if (this._isMounted) {
          this.setState({ description: '' });
        }
      })
  }

  handleChange = (event: any) => {
    this.setState({
      description: event.target.value
    });
  }

  handleDeleteComment = (commentId: string) => {
    firebase
      .firestore()
      .collection(COLLECTION.comments)
      .doc(commentId)
      .delete();
      toastr.info('Deleted comment', '');
  }

  showEditForm = () => {
    if (this._isMounted) {
      this.setState({ 
        showForm: !this.state.showForm,
        description: this.props.commentData.description
      })
    }
  }

  render = () => {
    return (
      <React.Fragment>
        <div className="single-comment-img-container">
          <Link to={`/users/${this.props.userData.documentId}`}>
            <img src={this.props.userData.profilePhotoUrl} alt="avatar" />
          </Link>
        </div>
        <div>
          {
          this.props.currentUser &&
          (
            this.props.currentUser.documentId === this.props.commentData.userId ||
            this.props.currentUser.documentId === this.props.postUserData?.documentId
          ) &&
            <React.Fragment>
              <span onClick={() => this.handleDeleteComment(this.props.commentData.commentId)} className="delete-comment-icon"></span>
              <span onClick={() => {this.showEditForm()}} className="edit-comment-icon"></span>
            </React.Fragment>
          }
          <Link to={`/users/${this.props.userData.documentId}`}>
            <span>
              <strong>
                {this.props.commentedUserData.length > 0 &&
                  this.props.userData &&
                  `${this.props.userData.firstName} ${this.props.userData.lastName}`}
              </strong>
            </span>
          </Link>
          <span className="comment-date">{this.props.commentData.createdOn}</span>
          <div className="comment-description">
            {this.state.showForm ?
              <form onSubmit={this.handleSubmit}>
                <input
                  type="text"
                  onChange={this.handleChange}
                  value={this.state.description}
                />
              </form> :
              `${this.props.commentData.description}`}
          </div>
        </div>
      </React.Fragment>
    )
  }
}

const mapStateToProps = ({ currentUser }: any) => {
  return { currentUser }
}

export default connect(mapStateToProps)(SingleComment);