import React, { useEffect, useRef } from "react";
import { Modal, Button } from "antd";
import {
  MeetingProvider,
  useMeeting,
  useParticipant
} from "@videosdk.live/react-sdk";

const Controls = ({ onLeave }) => {
  const { leave, toggleMic, toggleWebcam } = useMeeting();

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
      <Button onClick={toggleMic}>Mic</Button>
      <Button onClick={toggleWebcam}>Webcam</Button>
      <Button danger onClick={() => { leave(); onLeave(); }}>Leave</Button>
    </div>
  );
};

const ParticipantView = ({ participantId }) => {
  const {
    webcamStream,
    micStream,
    isWebcamOn,
    isMicOn,
    displayName,
  } = useParticipant(participantId);
  const videoRef = useRef(null);
  console.log("Webcam track:", webcamStream?.track?.id); // không gây lỗi circular


  useEffect(() => {
    if (videoRef.current && webcamStream && isWebcamOn) {
      try {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(webcamStream.track);
        videoRef.current.srcObject = mediaStream;
      } catch (error) {
        console.error("Lỗi khi gán stream vào videoRef:", error);
      }
    }
  }, [webcamStream, isWebcamOn]);

  return (
    <div style={{ border: "1px solid #ccc", padding: 10 }}>
      <h3>{displayName}</h3>
      {isWebcamOn && webcamStream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted // tránh tiếng vọng khi test local
          style={{ width: "300px", height: "200px", background: "#000" }}
        />
      ) : (
        <p>Camera off</p>
      )}
      {!isMicOn && <p>Mic off</p>}
    </div>
  );
};

const MeetingView = ({ onLeave }) => {
  const { participants, join } = useMeeting();

  useEffect(() => {
    join();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Video Call</h2>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[...participants.keys()].map((participantId) => (
          <ParticipantView key={participantId} participantId={participantId} />
        ))}
      </div>
      <Controls onLeave={onLeave} />
    </div>
  );
};

const VideoCallModal = ({ isCalling, setIsCalling, token, meetingId }) => {
  return (
    <Modal
      open={isCalling}
      onCancel={() => setIsCalling(false)}
      footer={null}
      width="100vw"
      style={{ top: 0, padding: 0 }}
      bodyStyle={{ height: "100vh", padding: 0 }}
      centered
      closable={false}
    >
      {token && meetingId && (
        <MeetingProvider
          config={{
            meetingId,
            micEnabled: true,
            webcamEnabled: true,
            name: "Tên người dùng",
          }}
          token={token}
        >
          <MeetingView onLeave={() => setIsCalling(false)} />
        </MeetingProvider>
      )}
    </Modal>
  );
};

export default VideoCallModal;
