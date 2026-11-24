namespace MidiMemeGame.Api.Workers;

internal static class DeploymentSlot
{
    internal static bool IsActive()
    {
        var slot = Environment.GetEnvironmentVariable("Deployment__Slot");
        if (string.IsNullOrEmpty(slot))
            return true;

        using var routing = File.OpenText("/run/midi-routing/upstreams.conf");
        return routing.ReadLine() == $"# midi-slot {slot}";
    }
}
