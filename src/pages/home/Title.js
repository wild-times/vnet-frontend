import reqData from '../../utils/wild';
import '../style/Title.css';


export default function Title (props) {
    const { user } = props;
    const name = user? !user['firstName'] && !user['lastName']? user.username: `${user['firstName']} ${user['lastName']}`: null;

    return (
        <div className="navbar" style={{backgroundImage: `url(${reqData.vnetBackgroundLarge})`}}>
            <img src={reqData.vnetLogo} alt="Logo for VNET" className="navbar_vnet_logo" />
                {
                    name?
                    <div className="navbar_userDetails">
                        <div className="navbar_userDetails_text">
                            <p className="navbar_userDetails_username">{ name }</p>
                            <span className="navbar_userDetails_email">{user['email']}</span>
                        </div>

                        <div className="navbar_userDetails_avatar">
                            <img src={user['profileImage']} alt="user_avatar" className="navbar_avatar_img" />
                        </div>
                    </div>: null
                }
        </div>
    )
}