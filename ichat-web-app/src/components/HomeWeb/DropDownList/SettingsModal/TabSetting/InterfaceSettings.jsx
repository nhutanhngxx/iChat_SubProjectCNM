// import React, { useContext, useState } from "react";
// import { Radio, Switch } from "antd";
// import "./css/InterfaceSettings.css";
// import { ThemeContext } from "../../../../../context/ThemeContext";

// const InterfaceSettings = () => {
//   const { mode, toggleTheme } = useContext(ThemeContext);
//   const [useAvatarAsBackground, setUseAvatarAsBackground] = useState(false);
//   console.log("Mode hiện tại:", mode);
//   console.log("toggleTheme function:", toggleTheme);

//   return (
//     <div className="interface-settings">
//       <h2>Cài đặt giao diện Beta</h2>

//       <div className="setting-item">
//         <Radio.Group
//           className="radio-group"
//           value={mode}
//           onChange={(e) => toggleTheme(e.target.value)}
//         >
//           <div>
//             <img src="https://i.ibb.co/9338MbM6/light.png" alt="Light Mode" />
//             <Radio value="light">Sáng</Radio>
//           </div>
//           <div>
//             <img src="https://i.ibb.co/tpY2VtZL/dark.png" alt="Dark Mode" />
//             <Radio value="dark">Tối</Radio>
//           </div>
//           <div>
//             <img src="https://i.ibb.co/VYd2nhtw/system.png" alt="System Mode" />
//             <Radio value="system">Hệ Thống</Radio>
//           </div>
//         </Radio.Group>
//       </div>

//       <div className="setting-item">
//         <label>Hình nền chat</label>
//         <div className="background-options">
//           <p>
//             Sử dụng Avatar làm hình nền
//             <Switch
//               checked={useAvatarAsBackground}
//               onChange={(checked) => setUseAvatarAsBackground(checked)}
//             />
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InterfaceSettings;
import React, { useContext, useState } from "react";
import { Radio, Switch } from "antd";
import { ThemeContext } from "../../../../../context/ThemeContext";
import "./css/InterfaceSettings.css";

const InterfaceSettings = () => {
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [useAvatarAsBackground, setUseAvatarAsBackground] = useState(false);
  console.log("Mode hiện tại:", mode);
  console.log("toggleTheme function:", toggleTheme);

  return (
    <div className="interface-settings">
      <h2>Cài đặt giao diện Beta</h2>

      <div className="setting-item">
        <Radio.Group
          className="radio-group"
          value={mode}
          onChange={(e) => toggleTheme(e.target.value)}
        >
          <div>
            <img src="https://i.ibb.co/9338MbM6/light.png" alt="Light Mode" />
            <Radio value="light">Sáng</Radio>
          </div>
          <div>
            <img src="https://i.ibb.co/tpY2VtZL/dark.png" alt="Dark Mode" />
            <Radio value="dark">Tối</Radio>
          </div>
          <div>
            <img src="https://i.ibb.co/VYd2nhtw/system.png" alt="System Mode" />
            <Radio value="system">Hệ Thống</Radio>
          </div>
        </Radio.Group>
      </div>

      <div className="setting-item">
        <label>Hình nền chat</label>
        <div className="background-options">
          <p>
            Sử dụng Avatar làm hình nền
            <Switch
              checked={useAvatarAsBackground}
              onChange={(checked) => setUseAvatarAsBackground(checked)}
            />
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterfaceSettings;
