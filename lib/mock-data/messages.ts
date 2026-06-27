export interface Message {
  id: string;
  sender: "client" | "nutritionist";
  text: string;
  time: string;
  audioUrl?: string;
  audioDuration?: number;
}

export const chatThreads: Record<string, Message[]> = {
  priya: [
    {
      id: "1",
      sender: "nutritionist",
      text: "Hi Priya, saw your bloating's down this week. Great progress!",
      time: "9:14 am",
    },
    {
      id: "1b",
      sender: "nutritionist",
      text: "",
      time: "9:16 am",
      audioUrl: "",
      audioDuration: 24,
    },
    {
      id: "2",
      sender: "client",
      text: "Thank you! Felt much lighter after cutting dairy",
      time: "9:20 am",
    },
    {
      id: "3",
      sender: "nutritionist",
      text: "Exactly what we wanted. Sticking to the plan this week too.",
      time: "9:21 am",
    },
    {
      id: "4",
      sender: "client",
      text: "Yes, will do. Can I swap tonight's paneer for tofu?",
      time: "9:25 am",
    },
    {
      id: "5",
      sender: "nutritionist",
      text: "Sure, tofu works just as well here. Go ahead.",
      time: "9:30 am",
    },
  ],
  ananya: [
    {
      id: "1",
      sender: "nutritionist",
      text: "Hi Ananya, noticed you haven't logged in a few days. Everything okay?",
      time: "Yesterday",
    },
    {
      id: "2",
      sender: "client",
      text: "Sorry, work has been hectic this week. Will catch up today",
      time: "Yesterday",
    },
  ],
  fatima: [
    {
      id: "1",
      sender: "nutritionist",
      text: "Welcome Fatima! Your first plan is ready, check the home tab.",
      time: "2 days ago",
    },
    {
      id: "2",
      sender: "client",
      text: "Got it, starting today!",
      time: "2 days ago",
    },
  ],
};
