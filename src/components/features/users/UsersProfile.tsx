import React, { Component } from 'react';
import { connect } from 'react-redux';
import firebase from '../../../config/firebaseService';
import PreviewModal from '../posts/PreviewModal';
import FollowersModal from './FollowersModal';
import FollowingModal from './FollowingModal';
import EditInfoModal from './EditInfoModal';

class UsersProfile extends Component<any, any> {
  _isMounted: boolean;
  refUserData: any;
  refPosts: any;
  updateUserBatch: any;
  docRefShowedUser: any;
  docRefCurrentUser: any;
  userRef: any;
  

  constructor(props: any) {
    super(props);
    this._isMounted = true;

    this.state = {
      userData: null,
      posts: null,
      show: false,
      showFollowers: false,
      showFollowing: false,
      showEditInfo: false,
      imgData: [],
    }
  }

  componentDidMount = () => {
    this.refUserData = firebase
      .firestore()
      .collection('users')
      .doc(this.props.match.params.id);
    this.refPosts = firebase
      .firestore()
      .collection('posts')

    this.refUserData = this.refUserData.onSnapshot(this.onCollectionUpdate)
  }

  showModal = (imgData: any) => {
    this.setState({ 
      show: true,
      imgData
     });
  };

  showFollowersModal = (userData: any) => {
    this.setState({
      showFollowers: true,
      userData
    })
  }

  showFollowingModal = (userData: any) => {
    this.setState({
      showFollowing: true,
      userData
    })
  }

  showEditInfoModal = (userData: any) => {
    this.setState({
      showEditInfo: true,
      userData
    })
  }
  
  hideModal = () => {
    this.setState({ show: false });
  };
  
  hideFollowersModal = () => {
    this.setState({ showFollowers: false });
  }
  
  hideFollowingModal = () => {
    this.setState({ showFollowing: false });
  }

  hideEditInfoModal = () => {
    this.setState({ showEditInfo: false })
  }

  renderFollowButton = () => {
    const userIsFollower = this.state.userData.followers.find((userId: { userDocumentId: any; }) => this.props.currentUser.documentId === userId.userDocumentId);
    if (userIsFollower) {
      return <button onClick={this.toggleFollowButton}>Unfollow</button>
    } else if (!userIsFollower && this.state.userData.documentId !== this.props.currentUser.documentId) {
      return <button onClick={this.toggleFollowButton}>Follow</button>
    }
  }

  toggleFollowButton = () => {
    const userIsFollower = this.state.userData.followers.find((userId: { userDocumentId: any; }) => this.props.currentUser.documentId === userId.userDocumentId);
    if (userIsFollower) {
      this.onUnfollow();
    } else {
      this.onFollow();
    }
  }

  onUnfollow = () => {
    this.updateUserBatch = firebase.firestore().batch();
    this.docRefShowedUser = firebase
      .firestore()
      .collection('users')
      .doc(this.props.currentUser.documentId);
    this.docRefCurrentUser = firebase
      .firestore()
      .collection('users')
      .doc(this.props.match.params.id);
    
    this.updateUserBatch.update(this.docRefShowedUser, {
      following: firebase.firestore.FieldValue.arrayRemove({
        userDocumentId: this.state.userData.documentId,
        firstName: this.state.userData.firstName,
        lastName: this.state.userData.lastName,
      }),
    });
    this.updateUserBatch.update(this.docRefCurrentUser, {
      followers: firebase.firestore.FieldValue.arrayRemove({
        userDocumentId: this.props.currentUser.documentId,
        firstName: this.props.currentUser.firstName,
        lastName: this.props.currentUser.lastName,
      }),
    })
    this.updateUserBatch.commit();
  }

  onFollow = () => {
    this.updateUserBatch = firebase.firestore().batch();
    this.docRefShowedUser = firebase
      .firestore()
      .collection('users')
      .doc(this.props.currentUser.documentId);
    this.docRefCurrentUser = firebase
      .firestore()
      .collection('users')
      .doc(this.props.match.params.id);
    
    this.updateUserBatch.update(this.docRefShowedUser, {
      following: firebase.firestore.FieldValue.arrayUnion({
        userDocumentId: this.state.userData.documentId,
        firstName: this.state.userData.firstName,
        lastName: this.state.userData.lastName,
      }),
    });
    this.updateUserBatch.update(this.docRefCurrentUser, {
      followers: firebase.firestore.FieldValue.arrayUnion({
        userDocumentId: this.props.currentUser.documentId,
        firstName: this.props.currentUser.firstName,
        lastName: this.props.currentUser.lastName,
      }),
    })
    this.updateUserBatch.commit();
  }

  onCollectionUpdate = (querySnapshot: { data: () => any; }) => {
    let userData = querySnapshot.data();
    let posts: { imgUrl: any; status: any; uploadedBy: any; userRefData: {}; title: any; description: any; comments: any; likes: any; postId: any; firstName: any; lastName: any; profilePhotoUrl: any; dateCreated: any; }[] = []; 
    this.refPosts && this.refPosts
      .where('uploadedBy', '==', userData.documentId)
      .onSnapshot((photosQuerySnapshot: any[]) => {
        posts = [];
        photosQuerySnapshot.forEach((post: { data: () => { imgUrl: any; status: any; uploadedBy: any; userRef: any; title: any; description: any; comments: any; likes: any; postId: any; firstName: any; lastName: any; dateCreated: any; }; }) => {
          const {
            imgUrl, 
            status,
            uploadedBy,
            userRef,
            title, 
            description, 
            comments, 
            likes, 
            postId, 
            firstName, 
            lastName,
            dateCreated
          } = post.data();
          if (
            status === 'public' ||
            this.props.currentUser.documentId === userData.documentId ||
            (status === 'private' &&
            this.props.currentUser &&
            this.props.currentUser.following &&
            this.props.currentUser.following.find((follower: { userDocumentId: any; }) => follower.userDocumentId === uploadedBy))
          ) {
            let userRefData: any = {}; 
            this.userRef = userRef.onSnapshot((user: { data: () => {}; }) => {
              userRefData = user.data();
              const profilePhotoUrl = userRefData.profilePhotoUrl
              posts.push({
                imgUrl,
                status,
                uploadedBy,
                userRefData,
                title,
                description,
                comments,
                likes,
                postId,
                firstName,
                lastName,
                profilePhotoUrl,
                dateCreated
              })
              if (this._isMounted) {
                this.setState({
                  userData,
                  posts
                })
              }
            })
          };
          })
      if (this._isMounted) {
        this.setState({
          userData,
          posts
        })
      }
      })
  }

  componentWillUnmount = () => {
    this._isMounted = false;
    this.refUserData = null;
    this.refPosts = null;
    this.userRef = null;
  }

  render = () => {
    return (
      <div>
      { this.state.userData && this.state.posts && (
        <React.Fragment>
          <PreviewModal 
            show={this.state.show}
            handleClose={this.hideModal}
            imgData={this.state.imgData}
          />
          <FollowersModal 
            show={this.state.showFollowers}
            handleClose={this.hideFollowersModal}
            userData={this.state.userData}
          />
          <FollowingModal 
            show={this.state.showFollowing}
            handleClose={this.hideFollowingModal}
            userData={this.state.userData}
          />
          <EditInfoModal 
            show={this.state.showEditInfo}
            handleClose={this.hideEditInfoModal}
            userData={this.state.userData}
          />
          <div className="user-data-container">
            <div className="avatar">
              <img
                onClick={() => this.showEditInfoModal(this.state.userData)} 
                src={this.state.userData.profilePhotoUrl || 
                "https://www.esportschampionships.tv/wp-content/uploads/2019/09/341-3415688_no-avatar-png-transparent-png.jpg"}
                alt="avatar"
              />
            </div>
            <div className="user-info-container">
              <div className="user-info-name">
                {`${this.state.userData.firstName} ${this.state.userData.lastName}`}
              </div>
              <div className="user-info-email">
              {`${this.state.userData.email}`}
              </div>
              <div className="user-info-follows">
                <span>Posts: {this.state.posts.length}</span>
                <span 
                  className="followers-link"
                  onClick={() => this.showFollowersModal(this.state.userData)}>
                  Followers: {this.state.userData.followers.length}
                </span>
                <span 
                  className="following-link"
                  onClick={() => this.showFollowingModal(this.state.userData)}>
                  Following: {this.state.userData.following.length}
                </span>
              </div>
              <div className="user-info-description">
                {this.state.userData.description}
              </div>
              <div className="user-info-buttons">
              {
                this.state.userData.documentId === this.props.currentUser.documentId && 
                <button onClick={() => this.showEditInfoModal(this.state.userData)}>Edit</button>
              }  
                { this.renderFollowButton() }
              </div>
            </div>
          </div>
          <div className="posts-container">
            { this.state.posts.length > 0 &&
              this.state.posts.map((data: { imgUrl: string | undefined; }, index: string | number | undefined) => {
              return (
                <div className="posts-container-img" key={index} onClick={() => this.showModal(data)}>
                  <img src={data.imgUrl} alt="img" />
                </div>
              ) 
            })}
          </div>
        </React.Fragment>
      )}  
      </div>
    );
  }
}

const mapStateToProps = ({ currentUser }: any) => {
  return { currentUser };
}

export default connect(mapStateToProps)(UsersProfile);