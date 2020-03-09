import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { UserData } from '../../../models/users/UserData';
import firebase from '../../../config/firebaseService';

type FollowersModalProps = {
  userData: UserData;
  show: boolean;
  handleClose: any;
}

type FollowersModalState = {
  filteredUsers: any[];
}

class FollowersModal extends Component<FollowersModalProps, FollowersModalState> {
  _isMounted: boolean;

  constructor(props: FollowersModalProps) {
    super(props);

    this._isMounted = true;
    this.state = {
      filteredUsers: [],
    }
  }

  componentDidMount = () => {
    this.getUserData();
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  getUserData = () => {
    firebase.firestore()
      .collection('users')
      .onSnapshot(snapshot => {
        if (this._isMounted) {
          this.setState({ filteredUsers: [] });
        }
        snapshot.forEach(user => {
          if (this._isMounted && this.props.userData.followers.find((userData: any) => userData.userDocumentId === user.data().documentId)) {
            this.setState(prevState => ({ 
              filteredUsers: [...prevState.filteredUsers, user.data()]
            }))
          }
        })
      })
  }
 
  render = () => {
    const showHideClassName = this.props.show ? 'modal display-block' : 'modal display-none';

    return (
      <div className={showHideClassName}>
        <section className="modal-main-followers">
        <h3>Followers</h3>
          {this.state.filteredUsers.length && this.state.filteredUsers.map((follower: UserData, index: number) => {
            return (
            <Link to={`/users/${follower.documentId}`} key={index} className="link-container">
              <div className="follower-container">
                <img className="modal-avatar" src={follower.profilePhotoUrl} alt="avatar"/>
                <span className="followers-name">{`${follower.firstName} ${follower.lastName}`}</span>
              </div>
            </Link>
          )})}
          <span onClick={this.props.handleClose} className="close-modal-icon"></span>
        </section>
      </div>
    );
  }
}

export default FollowersModal;