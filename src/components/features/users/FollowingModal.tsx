import React, { Component } from 'react';
import { Link } from 'react-router-dom'

class FollowingModal extends Component<any, any> {
 
  render = () => {
    const showHideClassName = this.props.show ? 'modal display-block' : 'modal display-none';
    // const showHideUnlikeButton = this.props.imgData.likes && this.props.imgData.likes.find(() => this.props.currentUser.documentId) ? 'heart-icon-liked' : 'hide-button'; 
    // const showHideLikeButton = this.props.imgData.likes && this.props.imgData.likes.find(() => this.props.currentUser.documentId) ? 'hide-button' : 'heart-icon-unliked'; 

    return (
      <div className={showHideClassName}>
        <section className="modal-main-followers">
          {this.props.userData.following.length && this.props.userData.following.map((follower: any, index: any) => {
            return (<Link to={`/users/${follower.userDocumentId}`} key={index}>
              <div>
                <img className="modal-avatar" src='' alt="modal"/>
                {`${follower.firstName} ${follower.lastName}`}
              </div>
            </Link>
          )})}
          <button onClick={this.props.handleClose}>close</button>
        </section>
      </div>
    );
  }
}

export default FollowingModal;