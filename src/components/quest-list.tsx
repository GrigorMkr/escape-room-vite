import QuestCard, {type Quest} from './quest-card';

type QuestListProps = {
  quests: Quest[];
};

const QuestList = ({quests}: QuestListProps) => (
  <div className="cards-grid">
    {quests.map((quest) => (
      <QuestCard key={quest.id} quest={quest} />
    ))}
  </div>
);

export default QuestList;

