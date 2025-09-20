import React from 'react';

const createIcon = (path: React.ReactNode) => (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    {path}
  </svg>
);

export const BookOpenIcon = createIcon(
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0v14.25" />
);

export const PlusIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
);

export const CogIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-.998.55-.01 1.02.457 1.11.998l.082.512a1.5 1.5 0 0 0 2.25.926l.433-.25c.5-.288 1.14.223 1.04.81l-.093.58a1.5 1.5 0 0 0 1.17 1.73l.55.15c.58.157.88.803.5 1.28l-.346.42a1.5 1.5 0 0 0 0 2.21l.346.42a.803.803 0 0 1-.5 1.28l-.55.15a1.5 1.5 0 0 0-1.17 1.73l.093.58c.1.587-.54.11-1.04.81l-.433-.25a1.5 1.5 0 0 0-2.25.926l-.082.512c-.09.542-.56 1.007-1.11.998-.55.01-1.02-.457-1.11-.998l-.082-.512a1.5 1.5 0 0 0-2.25-.926l-.433.25c-.5.288-1.14-.223-1.04-.81l.093-.58a1.5 1.5 0 0 0-1.17-1.73l-.55-.15c-.58-.157-.88-.803-.5-1.28l.346-.42a1.5 1.5 0 0 0 0-2.21l-.346-.42a.803.803 0 0 1 .5-1.28l.55-.15a1.5 1.5 0 0 0 1.17-1.73l-.093-.58c-.1-.587.54-.11 1.04-.81l.433.25a1.5 1.5 0 0 0 2.25-.926l.082-.512zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
);

export const SendIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
);

export const SpeakerIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
);

export const StopIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
);

export const LoaderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="animate-spin"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06 8.25 8.25 0 1 0 9.64 0 .75.75 0 0 0-1.06-1.06 6.75 6.75 0 1 1-7.52 0Z"
      clipRule="evenodd"
    />
  </svg>
);

export const XIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
);

export const TrashIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
);

export const CheckIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
);

export const EditIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
);

export const ArrowLeftIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
);

export const UploadIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
);

export const PlayIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
);

export const PauseIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
);

export const BookTextIcon = createIcon(
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v11.25a2.25 2.25 0 0 0 2.25 2.25h1.5v-2.25Z M12 6.042A8.966 8.966 0 0 1 18 3.75c1.052 0 2.062.18 3 .512v11.25a2.25 2.25 0 0 1-2.25 2.25h-1.5v-2.25Z M12 6.042V18.75m0-12.708a1.5 1.5 0 0 1 1.5 1.5v6.75a1.5 1.5 0 0 1-3 0V7.542a1.5 1.5 0 0 1 1.5-1.5Z" />
);

export const SparklesIcon = createIcon(
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
);
