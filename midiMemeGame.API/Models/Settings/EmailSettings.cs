namespace MidiMemeGame.Api.Models.Settings;

public class EmailSettings
{
    public const string SectionName = "Email";

    public int MaxSubjectLength { get; set; }
    public int MaxBodyLength { get; set; }
    public int ScheduledPollIntervalSeconds { get; set; }
    public int MaxMilestoneAgeHours { get; set; }
    public string DefaultEventId { get; init; } = "default";
    public int DeliveryBatchSize { get; init; }
    public int StaleLeaseMinutes { get; init; }
}