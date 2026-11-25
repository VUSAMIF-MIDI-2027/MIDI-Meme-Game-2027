using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace MidiMemeGame.Api.Controllers
{
    [Route("api/health")]
    [ApiController]
    [DisableRateLimiting]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { status = "ok" });
        }
    }
}
