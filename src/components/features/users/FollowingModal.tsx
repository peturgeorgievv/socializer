import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import firebase from '../../../config/firebaseService';
import { UserData } from '../../../models/users/UserData';

type FollowingModalProps = {
  userData: UserData;
  show: boolean;
  handleClose: any;
}

type FollowingModalState = {
  filteredUsers: any[];
}


class FollowingModal extends Component<FollowingModalProps, FollowingModalState> {
  _isMounted: boolean;

  constructor(props: FollowingModalProps) {
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
          if (this._isMounted && this.props.userData.following.find((userData: any) => userData.userDocumentId === user.data().documentId)) {
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
        <section className="modal-main-following">
        <h3>Following</h3>
          {this.state.filteredUsers.length && this.state.filteredUsers.map((following: UserData, index: number) => {
            return (
            <Link to={`/users/${following.documentId}`} key={index} className="link-container">
              <div className="following-container">
                <img className="modal-avatar" src={following.profilePhotoUrl} alt="avatar"/>
                <span className="following-name">{`${following.firstName} ${following.lastName}`}</span>
              </div>
            </Link>
          )})}
          <span onClick={this.props.handleClose} className="close-modal-icon"></span>
        </section>
      </div>
    );
  }
}

export default FollowingModal;